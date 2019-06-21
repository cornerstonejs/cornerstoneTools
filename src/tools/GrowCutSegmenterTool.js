import external from '../externalModules.js';
import BaseTool from './base/BaseTool.js';
// Drawing
import { draw, drawCircle, drawHandles, getNewContext } from '../drawing/index.js';
import toolColors from '../stateManagement/toolColors.js';
// TODO: Add GrowCutSegmenter cursor
import { wwwcRegionCursor } from './cursors/index.js';
import { modules } from '../store/index.js'
import { getToolState } from '../stateManagement/toolState.js';

/**
 * @public
 * @class GrowCutSegmenterTool
 * @memberof Tools
 *
 * @classdesc Tool for slicing brush pixel data
 * @extends Tools.Base.BaseTool
 */
export default class GrowCutSegmenterTool extends BaseTool {
  /** @inheritdoc */
  constructor(props = {}) {
    const defaultProps = {
      name: 'GrowCutSegmenter',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: {
      },
      svgCursor: null,
    };

    super(props, defaultProps);
    this._resetHandles();

    //
    // Touch
    //

    /** @inheritdoc */
    this.postTouchStartCallback = this._startOutliningRegion.bind(this);

    /** @inheritdoc */
    this.touchDragCallback = this._setHandlesAndUpdate.bind(this);

    /** @inheritdoc */
    this.touchEndCallback = this._applyStrategy.bind(this);

    //
    // MOUSE
    //

    /** @inheritdoc */
    this.postMouseDownCallback = this._startOutliningRegion.bind(this);

    /** @inheritdoc */
    this.mouseClickCallback = this._startOutliningRegion.bind(this);

    /** @inheritdoc */
    this.mouseDragCallback = this._setHandlesAndUpdate.bind(this);

    /** @inheritdoc */
    this.mouseMoveCallback = this._setHandlesAndUpdate.bind(this);

    /** @inheritdoc */
    this.mouseUpCallback = this._applyStrategy.bind(this);
  }

  /**
   * Render hook: draws the GrowCutSegmenter's outline, box, or circle
   *
   * @param {Cornerstone.event#cornerstoneimagerendered} evt cornerstoneimagerendered event
   * @memberof Tools.GrowCutSegmenterTool
   * @returns {void}
   */
  renderToolData(evt) {
    const eventData = evt.detail;
    const { element } = eventData;
    const color = toolColors.getColorIfActive({ active: true });
    const context = getNewContext(eventData.canvasContext.canvas);
    const handles = this.handles;

    draw(context, context => {

      // Configure
      const startCanvas = external.cornerstone.pixelToCanvas(
        element,
        this.handles.start
      );

      const endCanvas = external.cornerstone.pixelToCanvas(
        element,
        this.handles.end
      );

      // Calculating the radius where startCanvas is the center of the circle to be drawn
      const radius = _getDistance(startCanvas, endCanvas);

      // Draw Circle
      drawCircle(
        context,
        element,
        this.handles.start,
        radius,
        {
          color,
        },
        'pixel'
      );

      drawHandles(context, eventData, [this.handles.start]);
    });
  }

  /**
   * Sets the start handle point and claims the eventDispatcher event
   *
   * @private
   * @param {*} evt // mousedown, touchstart, click
   * @returns {Boolean} True
   */
  _startOutliningRegion(evt) {
    const consumeEvent = true;
    const element = evt.detail.element;
    const image = evt.detail.currentPoints.image;

    if (_isEmptyObject(this.handles.start)) {
      this.handles.start = image;
    } else {
      this.handles.end = image;
      this._applyStrategy(evt);
    }

    external.cornerstone.updateImage(element);

    return consumeEvent;
  }

  /**
   * This function will update the handles and updateImage to force re-draw
   *
   * @private
   * @method _setHandlesAndUpdate
   * @param {(CornerstoneTools.event#TOUCH_DRAG|CornerstoneTools.event#MOUSE_DRAG|CornerstoneTools.event#MOUSE_MOVE)} evt  Interaction event emitted by an enabledElement
   * @returns {void}
   */
  _setHandlesAndUpdate(evt) {
    const element = evt.detail.element;
    const image = evt.detail.currentPoints.image;

    this.handles.end = image;
    external.cornerstone.updateImage(element);
  }

  /**
   * Event handler for MOUSE_UP/TOUCH_END during handle drag event loop.
   *
   * @private
   * @method _applyStrategy
   * @param {(CornerstoneTools.event#MOUSE_UP|CornerstoneTools.event#TOUCH_END)} evt Interaction event emitted by an enabledElement
   * @returns {void}
   */
  _applyStrategy(evt) {
    if (
      _isEmptyObject(this.handles.start) ||
      _isEmptyObject(this.handles.end)
    ) {
      return;
    }

    const { element } = evt.detail;

    evt.detail.handles = this.handles;
    _applySegmentationChanges(evt, this.configuration, this.handles);

    this._resetHandles();
  }

  /**
   * Sets the start and end handle points to empty objects
   *
   * @private
   * @method _resetHandles
   * @returns {undefined}
   */
  _resetHandles() {
    this.handles = {
      start: {},
      end: {}
    };
  }
}

/**
 * Helper to determine if an object has no keys and is the correct type (is empty)
 *
 * @private
 * @function _isEmptyObject
 * @param {Object} obj The object to check
 * @returns {Boolean} true if the object is empty
 */
const _isEmptyObject = obj =>
  Object.keys(obj).length === 0 && obj.constructor === Object;


async function _applySegmentationChanges(evt, config, points) {
  const eventData = evt.detail;
  const { image, element } = eventData;
  const brushModule = modules.brush;
  const { width, height } = image;

  const previewLabelmapIndex = 1;
  const labelmap = brushModule.setters.activeLabelmap(element, previewLabelmapIndex)
  let previewToolData = brushModule.getters.labelmapBuffers(element, previewLabelmapIndex);
  let segmentationData = new Uint16Array(previewToolData.buffer);

  brushModule.getters.getAndCacheLabelmap2D(element);

  // TODO: Hardcoded! Only sets a value of 1 in the labelmap
  const labelValue = 1

  const previewLabelValue = 2

  const stack = getToolState(element, 'stack');
  const numFrames = stack.data[0].imageIds.length;

  const backgroundVolume = new Int16Array(width * height * numFrames);
  const promises = [];
  stack.data[0].imageIds.forEach((imageId, index) => {
    const promise = cornerstone.loadAndCacheImage(imageId).then(image => {
        const array = image.getPixelData().slice(0, width * height);

        backgroundVolume.set(array, width*height*index);
    });

    promises.push(promise);
  });

  await Promise.all(promises);

  const imageIndex = stack.data[0].currentImageIdIndex;
  const updatedData = growCutSegmenterTool(points, segmentationData, image, backgroundVolume, 1, imageIndex)

  segmentationData.set(updatedData);
  /*previewToolData.buffer = updatedData.buffer;

  for (let i=0; i< 1000; i++) {
    segmentationData[i] = 1;
  }

  console.warn(updatedData);
  console.warn(segmentationData);*/

  // Invalidate the brush tool data so it is redrawn
  brushModule.setters.invalidateBrushOnEnabledElement(element, previewLabelmapIndex);

  // TODO: If the segmentation is 'confirmed', dump this new data into the original labelmap
  // - Use only the bounding box of the ROI that we know has changed
  //const activeLabelmapIndex = 0; // TODO: Hardcoded for now, only works on first labelmap!
  //const toolData = brushModule.getters.labelmapBuffers(element, activeLabelmapIndex);
};

function growCutSegmenterTool(points, labelmapData, image, backgroundVolume, labelValue = 1, imageIndex) {
  const { width, height } = image;

  // Set the center point of the circle to the 'inside'
  const insideValue = 1
  const { x, y } = points.start;
  const xRound = Math.round(x);
  const yRound = Math.round(y);

  labelmapData[yRound * width + xRound] = insideValue;

  // Set the circumference points to the 'outside'
  const radius = _getDistance(points.end, points.start);
  const circumferencePoints = getCircumferencePoints(points.start, radius, width, height);

  const outsideValue = 2;//2
  circumferencePoints.forEach(point => {
    const { x, y } = point;
    const xRound = Math.round(x);
    const yRound = Math.round(y);

    labelmapData[width * height * imageIndex + yRound * width + xRound] = outsideValue;
  });


  // TODO: Potential performance improvement:
  // - Find the bounding box of the circle
  // - Extract only the background volume within that bounding box, across all slices
  // - Create labelmap which is the size of only the bounding box for use by GrowCut GLSL filter
  // - After algorithm completes, push preview data back into full volume so that it can be visualized.
  const backgroundDataset = arrayToDataset(backgroundVolume, { width, height, numFrames: 2 })
  const labelmapDataset = arrayToDataset(labelmapData, { width, height, numFrames: 2 })

  const outputFields = performGrowCut(backgroundDataset, labelmapDataset);
  const result = new Uint16Array(outputFields[1].generatedPixelData);

  console.warn(result);
  return result;
}


// TODO: Surely this is in cornerstoneMath?? Why are we duplicating it?
/**
 * Returns the distance in canvas from the given coords to the center of the circle annotation.
 *
 * @param {*} startCoords - start point cooridnates
 * @param {*} endCoords - end point cooridnates
 * @returns {number} number - the distance between two points (start and end)
 */
function _getDistance(startCoords, endCoords) {
  const dx = startCoords.x - endCoords.x;
  const dy = startCoords.y - endCoords.y;

  return Math.sqrt(dx * dx + dy * dy);
}

function getCircumferencePoints(center, radius, width, height) {
  const points = [];
  for (let i = 0; i < 360; i++) {
    const angleRadians = i * Math.PI / 180;
    let x = radius * Math.cos(angleRadians) + center.x;
    x = Math.min(x, width);
    x = Math.max(x, 0);
    let y = radius * Math.sin(angleRadians) + center.y;
    y = Math.min(y, height);
    y = Math.max(y, 0);

    points.push({
      x,
      y
    });
  }

  return points;
}

let step = {
  options : {
    newVolumeThreeD : false,
  },
  uniforms : {
    pointLight: { type: '3fv', value: [100., -400., 1500.] },
    gradientSize: { type: '1f', value: 1. },
    rayMaxSteps: { type: '1i', value: 10000 },
    sampleStep: { type: '1f', value: 0.5 },
    renderCanvasWidth: { type: '1f', value: 512 },
    renderCanvasHeight: { type: '1f', value: 512 },
    sliceMode: { type: '1i', value: 1 },
    Kambient: { type: '1f', value: 1.5 },
    Kdiffuse: { type: '1f', value: .95 },
    Kspecular: { type: '1f', value: .8 },
    Shininess: { type: '1f', value: 10 },
  },
};

const canvas = document.createElement('canvas');
canvas.id = 'renderCanvas';
document.body.appendChild(canvas);

let gl = canvas.getContext('webgl2');
if (!gl) {
  alert('Sorry, it looks like your browser does not support webgl2.  Try firefox.');
}

// check if our gl supports float textures and if
// so set the Field and Generator class variables so all instances use
// the same type
let glExtensions = {};
let expectedExtensions = [
  "EXT_color_buffer_float",
  "OES_texture_float_linear",
]; /* TODO WEBGL_debug_renderer_info WEBGL_lose_context */
expectedExtensions.forEach(extensionName => {
  glExtensions[extensionName] = gl.getExtension(extensionName);
});
let hasTextureFloatLinear = 'OES_texture_float_linear' in glExtensions;
let hasColorBufferFloat = 'EXT_color_buffer_float' in glExtensions;
Field.useIntegerTextures = !(hasTextureFloatLinear && hasColorBufferFloat);
if (Field.useIntegerTextures) {
  // TODO: this mode should probably go away in order to simplify the code
  // https://webglstats.com/webgl2/extension/OES_texture_float_linear
  console.warn('Floating texture support not available');
}
Generator.useIntegerTextures = Field.useIntegerTextures;


step.renderer = new RayCastRenderer({
  gl,
  canvas,
  uniforms: step.uniforms,
  inputFields: [],
});
step.view = new View({
  viewBoxMax : [250, 250, -250],
  viewBoxMin : [-250, -250, -200],
  viewPoint : [0., -400., 0.],
  viewNormal : [0., 1., 0.],
  viewUp : [0., 0., 1.],
});
step.renderer.glExtensions = glExtensions;
step.renderer.updateProgram();
step.renderer._render(step.view);

window.step = step;

function arrayToDataset(data, { width, height, numFrames }) {
  const spacings = [1,1,1]

  const dataset = {
    "SOPClassUID": dcmjs.data.DicomMetaDictionary.sopClassUIDsByName["EnhancedCTImage"],
    "Columns": String(width),
    "Rows": String(height),
    "NumberOfFrames": String(numFrames),
    "SamplesPerPixel": 1,
    "BitsStored": 16,
    "HighBit": 15,
    "WindowCenter": [ "84" ], // any better option? - TODO: estimate from random sample histogram
    "WindowWidth": [ "168" ], // any better option?
    "BitsAllocated": 16,
    "PixelRepresentation": 1,
    "RescaleSlope": "1",
    "RescaleIntercept": "0",
    "SharedFunctionalGroupsSequence": {
      "PlaneOrientation": {
        "ImageOrientationPatient": [
          String(1),
          String(0),
          String(0),
          String(0),
          String(1),
          String(0)
        ]
      },
      "PixelMeasuresSequence": {
        "PixelSpacing": [ String(spacings[0]), String(spacings[1]) ],
        "SpacingBetweenSlices": String(spacings[2])
      },
      "PixelValueTransformation": {
        "RescaleIntercept": "0",
        "RescaleSlope": "1",
        "RescaleType": "US"
      }
    },
    "PixelData": data,
    _vrMap: {},
    _meta: {}
  };

  const origin = [0,0,0]
  const sizes = [256, 256, 2];

  dataset.PerFrameFunctionalGroupsSequence = [];
  for (let frameIndex of Array(sizes[2]).keys()) {
    dataset.PerFrameFunctionalGroupsSequence.push({
      "PlanePosition": {
        "ImagePositionPatient": [
          String(origin[0] + frameIndex),
          String(origin[1] + frameIndex),
          String(origin[2] + frameIndex)
        ]
      },
    });
  }

  return dataset;
}


function performGrowCut(backgroundDataset, labelmapDataset) {
  console.log('starting performGrowCut');

  let backgroundField = Field.fromDataset(backgroundDataset)[0];
  step.renderer.inputFields.push(backgroundField);
  step.renderer.updateProgram();


  /*let backgroundField = step.renderer.inputFields[step.renderer.inputFields.length-1];
  if (!backgroundField || backgroundField.constructor.name != "ImageField") {
    alert('Need to have a background image field');
    return;
  }*/

  let labelFields = [];
  let strengthFields = [];

  [0,1].forEach(index => {
    let derivedImage = new dcmjs.derivations.DerivedImage([backgroundField.dataset]);
    let labelField = Field.fromDataset(derivedImage.dataset)[0];
    let strengthField = Field.fromDataset(derivedImage.dataset)[0];
    labelFields.push(labelField);
    strengthFields.push(strengthField);

    step.renderer.inputFields.push(labelField);
    step.renderer.inputFields.push(strengthField);

    console.log('added field', index);
  });

  labelFields[0] = Field.fromDataset(labelmapDataset)[0]
  step.renderer.inputFields[1] = Field.fromDataset(labelmapDataset)[0]


  // TODO: don't need to upload texture of generated fields
  step.renderer.updateProgram();
  console.log('updated program');
  let iterationMode = null//'animated';

  backgroundField.visible = 0;
  let iterations = 50;
  let iteration = 0;
  let animationFrame = function() {
    let inBuffer = iteration%2;
    let outBuffer = (iteration+1)%2;

    if (!step.growcut) {
      step.growcut = new GrowCutGenerator({
        gl: step.renderer.gl,
      });

      step.growcut.uniforms.iterations.value = iterations;
      step.growcut.inputFields = [backgroundField,
        labelFields[inBuffer],
        strengthFields[inBuffer]];

      step.growcut.outputFields = [labelFields[outBuffer],
        strengthFields[outBuffer]];
      step.growcut.updateProgram();
    }

    step.growcut.uniforms.iteration.value = iteration;
    labelFields[inBuffer].visible = 0;
    strengthFields[inBuffer].visible = 0;
    labelFields[outBuffer].visible = 1;
    strengthFields[outBuffer].visible = 0;

    console.log(iteration,'generating');

    step.growcut.inputFields = [backgroundField,
      labelFields[inBuffer],
      strengthFields[inBuffer]];
    step.growcut.outputFields = [labelFields[outBuffer],
      strengthFields[outBuffer]];
    // for the final iteration, save the calculation result to CPU
    if (iteration == iterations-1) {
      // outputfields[0] is the labelmap, 1 is the strength
      step.growcut.outputFields.forEach(outputField => {
        outputField.generatedPixelData = outputField.dataset.PixelData;
      });

      console.log(step.growcut.outputFields);
    }
    step.growcut.generate();
    console.log(iteration,'rendering');
    step.renderer._render();
    iteration++;
    if (iteration < iterations) {
      // not finished, trigger another itertion
      console.log(`Iteration ${iteration} of ${iterations}`);
      if (iterationMode == 'animated') {
        requestAnimationFrame(animationFrame); // continue iterating
      }
    } else {
      console.log(`Finished ${iterations} iterations`);
      [0,1].forEach(index=>{
        labelFields[index].visible = 0;
        strengthFields[index].visible = 0;
      });
      backgroundField.visible = 1;
      labelFields[outBuffer].visible = 1;
      step.renderer._render();
      console.log('finished');
    }
  }
  if (iterationMode == 'animated') {
    requestAnimationFrame(animationFrame); // start the iterations
  } else {
    for (let i = 0; i < iterations; i++) {
      animationFrame();
    }
  }
  step.renderer.requestRender(step.view);

  console.warn('DONE!');
  return step.growcut.outputFields;
}
