## Segmentation {#segmentation}

The segmentation module deals with centralisation of 3D labelmap data for each stack of cornerstone images. The data is centralized for two reasons:

- Cornerstone data stored per imageId is of a 2D format, and labelmaps are very much 3D structures. Having the data for an entire 3D labelmap centralized, and 2D and 3D representations of it being accessible by cornerstone as needed provides the flexibility to perfom both 2D and 3D operations without having to re-aggregate data each time.
- Storing the 3D labelmap in one `ArrayBuffer` allows for better interoperability and harmonous integration with 3D platforms, such as [vtk-js](https://kitware.github.io/vtk-js/). If using a WebGL library such as `vtk-js`, it is recommended you set the use of `Float32Array` segmentations in the segmentation module configuration.

### Data Structure

The data is stored in a _top-down_ hierarchal fashion, with the coarsest level being study-wide. The types themselves are JSDoc'd in `src/store/modules/segmentationModule/index.js`, but a more in-depth overview is given here:

#### Series

The series object under `state.series` is the highest level object, containing a set of `BrushStackState`s with a 1:1 correlation with cornerstone stacks. Each `BrushStackState` is currently indexed each stack by the imageId of the first image in the stack.

#### BrushStackState

A `BrushStackState` object contains two properties:

- `labelmaps3D`: An array of one or more `Labelmap3D` objects, which are the same dimensions as the stack (`width * height * numberOfFrames`).
- 'activeLabelmapIndex`: The array index of the active labelmap.

Each `Labelmap3D` object can contain multiple non-overlapping segments. To use have overlapping segments in your application, use multiple `Labelmap3D`s.

#### Labelmap3D

A `Labelmap3D` is a single, non-overlapping labelmap with the following properties:

- `buffer`: An `ArrayBuffer` where the labels for each voxel are stored sequentially in increasing x, y, z. It has the same orientation as the stack, so increasing `z` is increasing `imageIdIndex` in the stack. By default, each label is stored as 2 bytes (encoded as Uint16Array), allowing for up to `65535` unique segments (+ 0 being empty/unlabelled). By setting the segmentation configuration property `arrayType` to `Float32Array` you can instead store the labelmap as a format more harmonious with `vtkjs`. `vtkjs` has to convert non-`Float32Array`s when generating textures to pass to the GPU, and this is very costly. If you are using vtkjs in your application its highly recommended to use `Float32Array`s for segmentations for decreased texture building times. This is especially noticable when using the `vtkjs` paint widget, for example.
- `labelmaps2D`: An array of `labelmap2D` views on the `buffer`, indexed by in-stack `imageIdIndex`. The `labelmaps2D` array is initially empty, and each view is defined only if data is added to it, and should be removed if set empty (all zero labels). This makes it easy for the segmentation renderer, I/O libraries such as [`dcmjs`](https://github.com/dcmjs-org/dcmjs), and tools to localise the extent of segments without having to scan through every label in the stack.
- `metadata`: An array of metadata objects per segment. Metadata is optional and its form is application specific. You may want a simple name for your label in your UI, or you may want more complex objects referencing standard libraries for anatomical region. The metadata is not used internally by `cornerstoneTools`, but acts an optional logical place to keep such data for your application.
- `activeSegmentIndex`: The index of the segment to be created/modified when using `BaseBrushTool`s or segmentation tools, when th labelmap is active.
- `colorLUTIndex`: The index of the colorLUT to use when rendering the labelmap.
- `segmentsHidden`: An array of segments to hide from the canvas. Initially empty to save space, set an index to `true` to hide the corresponding segment.

#### Labelmap2D

A `Labelmap2D` is a 2D view of one frame of the segmentation, it is the object primarily interacted with from the cornerstone canvas, and has the following properties:

- `pixelData`: a `Uint16Array` or `Float32Array` view of a portion of the parent `Labelmap3D`'s `buffer`, corresponding to the frame. Array type depends on the segmentation module's `arrayType` setting.
- `segmentsOnLabelmap`: An array of segments present in the `pixelData`. Whenever a tool or external manipulates the `pixelData` viewed by the `Labelmap2D`, this list should be updated. This is generally very cheap to do on the fly, e.g. after a scissor action or after a full brush stroke, but speeds up IO dramatically when compressing data to DICOMSEG, for instance, as you can work out how much memory needs to be allocated with very simple checks.

### Usage within cornerstoneTools

When using a tool on a cornerstone image, you can easily access the `Labelmap2D` of the active `Labelmap3D`. by querying the segmentationModule:

Import the `segmentationModule` `getters` at the top of the file.

```js
import { getModule } from './store'; //appropriate relative path

// Destructure the parts of the module you require from the getters, setters, state and configuration. Here we only need the getters.
const { getters } = getModule('segmentation');
```

Then during `cornerstoneTools` event callback, where `evt` is the event:

```js
const eventData = evt.detail;
const element = eventData.element;

const {
  labelmap2D, // The `Labelmap2D` for this imageId.
  labelmap3D, // The `Labelmap3D` for this stack.
  currentImageIdIndex, // The currentImageIdIndex of this image in the stack.
  activeLabelmapIndex, // The labelmapIndex of this active labelmap.
} = getters.labelmap2D(element);
```

This provides you all the information you need. You can grab as few or as many elements of this object as you need by destructuring appropriately.

#### Editing the labelmap directly

You can then edit the labelmap directly:

```js
const { pixelData } = labelmap2D;

pixelData[1337] = 9001;
```

#### Using the `drawBrushPixels` helper

Or if using a brush you can use the `drawBrushPixels` helper to paint an array of 2D-coordinates to the `Labelmap2D`.

```js
const { rows, columns } = eventData.image;
const pointerArray = [[0, 0], [1, 0], [2, 0]]; // Something grabbed by your brush.
const shouldErase = false;

// Imported from src/util/segmentation
drawBrushPixels(
  pointerArray,
  labelmap2D.pixelData,
  labelmap3D.activeSegmentIndex,
  columns,
  shouldErase
);
```

To get the labelmap2D of another image in the stack which is not currently displayed:

```js
const imageIdIndex = 99;

const labelmap2DofImageIdIndex99 = getters.labelmap2DByImageIdIndex(
  labelmap3D,
  imageIdIndex,
  rows,
  columns
);
```

An example of this usage can be found in the `SphericalBrushTool`.

Both `getters.labelmap2D` and `getters.labelmap2DByImageIdIndex` will return the `Labelmap2D` if it exists, and create it and return it if not.

Additionally `getters.labelmap2D` will initialise and create both the `BrushStackState` and `Labelmap3D`, if neither exist yet.

### Updating labelmap occupancy

Upon finishing an operation on a `Labelmap2D`, the tool/operation should call `setters.updateSegmentsOnLabelmap2D(labelmap2D)` on the `Labelmap2D` to update its `segmentsOnLabelmap` property. This property being correct up to date is useful for other tools, and I/O libraries.

This is not done automatically, because the end of an operationn might depend on the task. E.g. after one use of the `CircleScissorsTool`, we'll call `updateSegmentsOnLabelmap2D`, however we only do it at the _end_ of `BrushTool` stroke. You may have a more complicated procedure whereby you perform a series of iterative growcuts with human intervention, and only want to update the labelmap occupancy at the end.

### Usage by application

The parent application can retrieve information about the labelmaps by querying the API. From `metadata`, to `colorLUT`s per `Labelmap3D`.

The most useful getter function is probably `getLabelmaps3D(elementOrEnabledElementUID)`, which when given a cornerstone `element`, or a cornerstone `enabledElement`'s UUID, returns a list of `Labelmap3D` objects, which can be parsed in order to generate UI.

A set of `setters` can be linked to UI components to change the active segment, set segment color, etc, refer to the API documentation for a full list of helpers.

### Usage by third party libraries.

You may wish to access one or more `Labelmap3D` `buffers` from outside `cornerstoneTools`, in order to either export them to persistent storage, or display them in another framwork, such as [`vtkjs`](https://kitware.github.io/vtk-js/).

To retrieve the ArrayBuffer for the activeLabelmap on an `element`, from outside of `cornerstoneTools`:

```js
const { getters } = cornerstoneTools.getModule('segmentation');

// Active buffer:
const { buffer, labelmapIndex, colorLUT } = getters.activeLabelmapBuffer(
  element
);

// All labelmap buffers:
const bufferInfoArray = getters.labelmapBuffers(element);

// A specific buffer:
const { buffer7, colorLUT7 } = getters.labelmapBuffers(element, 3);
```

These functions also return the `colorLUT` (not just its index), so that you can map another renderer to the same color scheme. Note these are just helper functions, and you can indeed fetch all the `Labelmap3D` objects with `getters.labelmaps3D`, and extract this/more information if you desire.

### Backdoor

Note that other than from the API, you can always access the global `series` object:

```js
const { state } = getModule('segmentation');
const series = state.series;
```

But only modify these if you know what you are doing, as you could potentially break your application by uncleanly deleting/modifying things.
