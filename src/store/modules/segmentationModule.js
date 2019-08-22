import external from '../../externalModules.js';
import { getToolState } from '../../stateManagement/toolState.js';
import getNewColorLUT from '../../util/segmentation/brush/getNewColorLUT.js';
import labelmapStats from '../../util/segmentation/brush/labelmapStats.js';
import EVENTS from '../../events.js';

import { getters as storeGetters } from '../index.js';

import { getLogger } from '../../util/logger.js';
import pointInImage from '../../util/pointInImage.js';

const logger = getLogger('store:modules:segmentationModule');

// Internal state of the brush module.
const state = {
  colorMapId: 'BrushColorMap',
  series: {},
  colorLutTables: {},
};

const configuration = {
  renderOutline: true,
  renderFill: true,
  renderInactiveLabelmaps: true,
  radius: 10,
  minRadius: 1,
  maxRadius: 50,
  segmentsPerLabelmap: 65535, // Max is 65535 due to using 16-bit Unsigned ints.
  fillAlpha: 0.2,
  fillAlphaInactive: 0.1,
  outlineAlpha: 0.7,
  outlineAlphaInactive: 0.35,
  outlineWidth: 3,
};

/**
 * A map of `firstImageId` to associated `BrushStackState`, where
 * `firstImageId` is the `imageId` of the first image in a stack.
 *
 * @typedef {Object} Series
 */

/**
 * @typedef {Object} BrushStackState An object defining a set of 3D labelmaps
 *    associated with a specific cornerstone stack.
 * @property {string} activeLabelmapIndex The index of the active `Labelmap3D`.
 * @property {Labelmap3D[]} labelmaps3D An array of `Labelmap3D` objects.
 */

/**
 * An
 *
 * @typedef {Object} Labelmap3D An object defining a 3D labelmap.
 * @property {ArrayBuffer}  buffer An array buffer to store the pixel data of the `Labelmap3D` (2 bytes/voxel).
 * @property {Labelmap2D[]} labelmaps2D array of `labelmap2D` views on the `buffer`, indexed by in-stack
 *                          image positions.
 * @property {Object[]} metadata An array of metadata per segment. Metadata is optional and its form is
 *                               application specific.
 * @property {number} activeSegmentIndex The index of the active segment for this `Labelmap3D`.
 * @property {boolean[]} segmentsVisible The visibility of segments on this labelmap.
 *                                       If an element is undefined, the visibility of that defaults to true.
 */

/**
 * @typedef {Object} Labelmap2D An object defining a 2D view on a section of a `Labelmap3D`'s `buffer`.
 * @property {Uint16Array} pixelData A 2D view on a section of the parent `Labelmap3D`'s `buffer`.
 * @property {number[]} segmentsOnLabelmap An array of segments present in the `pixelData`.
 * @property {boolean} invalidated Whether the data has been changed recently, and a new `ImageBitmap` should be created
 *                                 for the segmentation fill should this `labelmap2D` be rendered.
 */

/**
 * GetMetadata - Returns the metadata object for a partiular segment if
 * segmentIndex is specified, otherwise returns an array of all segment metadata
 * for the labelmap.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @param  {number} [labelmapIndex]    If undefined, defaults to the active
 *                                     labelmap index.
 * @param  {number} [segmentIndex]     The segment index.
 * @returns {Object|Object[]}          A metadata object or an array of
 *                                     metadata objects.
 */
function getMetadata(elementOrEnabledElementUID, labelmapIndex, segmentIndex) {
  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];
  const firstImageId = stackData.imageIds[0];

  const brushStackState = state.series[firstImageId];

  if (!brushStackState) {
    logger.warn(`brushStackState is undefined`);

    return;
  }

  if (labelmapIndex === undefined) {
    labelmapIndex = brushStackState.activeLabelmapIndex;
  }

  if (!brushStackState.labelmaps3D[labelmapIndex]) {
    logger.warn(`No labelmap3D of labelmap index ${labelmapIndex} on stack.`);

    return;
  }

  const labelmap3D = brushStackState.labelmaps3D[labelmapIndex];

  if (segmentIndex === undefined) {
    return labelmap3D.metadata;
  }

  return labelmap3D.metadata[segmentIndex];
}

/**
 * GetLabelmaps3D - Returns the `Labelmap3D` objects associated with the series displayed
 * in the element, the `activeLabelmapIndex` and the `currentImageIdIndex`.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @returns {Object}              An object containing `Labelmap3D` objects,
 *                                the `activeLabelmapIndex` amd the `currentImageIdIndex`.
 */
function getLabelmaps3D(elementOrEnabledElementUID) {
  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];

  const firstImageId = stackData.imageIds[0];
  const brushStackState = state.series[firstImageId];

  let labelmaps3D;
  let activeLabelmapIndex;

  if (brushStackState) {
    labelmaps3D = brushStackState.labelmaps3D;
    activeLabelmapIndex = brushStackState.activeLabelmapIndex;
  }

  return {
    labelmaps3D,
    activeLabelmapIndex,
    currentImageIdIndex: stackData.currentImageIdIndex,
  };
}

/**
 * GetAndCacheLabelmap2D - Returns the active `labelmap3D` and the `currentImageIdIndex`.
 *                         If a labelmap does not get exist, creates a new one.
 *                         generates a `labelmap2D` for the `currentImageIndex` if it
 *                         does not yet exist.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @returns {Object}              The `Labelmap3D` and the currentImageIdIndex.
 */
function getAndCacheLabelmap2D(elementOrEnabledElementUID) {
  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const cornerstone = external.cornerstone;
  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];

  const enabledElement = cornerstone.getEnabledElement(element);

  const currentImageIdIndex = stackData.currentImageIdIndex;
  const { rows, columns } = enabledElement.image;

  const numberOfFrames = stackData.imageIds.length;
  const firstImageId = stackData.imageIds[0];

  let brushStackState = state.series[firstImageId];

  let activeLabelmapIndex;

  if (brushStackState) {
    activeLabelmapIndex = brushStackState.activeLabelmapIndex;

    if (!brushStackState.labelmaps3D[activeLabelmapIndex]) {
      _addLabelmap3D(
        brushStackState,
        activeLabelmapIndex,
        rows * columns * numberOfFrames
      );
    }

    if (
      !brushStackState.labelmaps3D[activeLabelmapIndex].labelmaps2D[
        currentImageIdIndex
      ]
    ) {
      _addLabelmap2DView(
        brushStackState,
        activeLabelmapIndex,
        currentImageIdIndex,
        rows,
        columns
      );
    }
  } else {
    activeLabelmapIndex = 0;

    state.series[firstImageId] = {
      activeLabelmapIndex,
      labelmaps3D: [],
    };

    brushStackState = state.series[firstImageId];

    _addLabelmap3D(
      brushStackState,
      activeLabelmapIndex,
      rows * columns * numberOfFrames
    );

    _addLabelmap2DView(
      brushStackState,
      activeLabelmapIndex,
      currentImageIdIndex,
      rows,
      columns
    );
  }

  return {
    labelmap3D: brushStackState.labelmaps3D[activeLabelmapIndex],
    currentImageIdIndex,
    activeLabelmapIndex,
  };
}

/**
 * GetIsSegmentVisible -  Returns if a segment is visible.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @param  {number} segmentIndex     The segment index.
 * @param  {number} [labelmapIndex]    If undefined, defaults to the active
 *                                     labelmap index.
 * @returns {boolean} True if the segment is visible.
 */
function getIsSegmentVisible(
  elementOrEnabledElementUID,
  segmentIndex,
  labelmapIndex
) {
  if (!segmentIndex) {
    return;
  }

  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];
  const firstImageId = stackData.imageIds[0];

  const brushStackState = state.series[firstImageId];

  if (!brushStackState) {
    logger.warn(`brushStackState is undefined`);

    return;
  }

  if (labelmapIndex === undefined) {
    labelmapIndex = brushStackState.activeLabelmapIndex;
  }

  if (!brushStackState.labelmaps3D[labelmapIndex]) {
    logger.warn(`No labelmap3D of labelmap index ${labelmapIndex} on stack.`);

    return;
  }

  const labelmap3D = brushStackState.labelmaps3D[labelmapIndex];
  const visible = labelmap3D.segmentsVisible[segmentIndex];

  return visible || visible === undefined;
}

/**
 * SetToggleSegmentVisibility - Toggles the visability of a segment.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @param  {number} segmentIndex     The segment index.
 * @param  {number} [labelmapIndex]    If undefined, defaults to the active
 *                                     labelmap index.
 * @returns {boolean} True if the segment is now visible.
 */
function setToggleSegmentVisibility(
  elementOrEnabledElementUID,
  segmentIndex,
  labelmapIndex
) {
  if (!segmentIndex) {
    return;
  }

  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];
  const firstImageId = stackData.imageIds[0];

  const brushStackState = state.series[firstImageId];

  if (!brushStackState) {
    logger.warn(`brushStackState is undefined`);

    return;
  }

  if (labelmapIndex === undefined) {
    labelmapIndex = brushStackState.activeLabelmapIndex;
  }

  if (!brushStackState.labelmaps3D[labelmapIndex]) {
    logger.warn(`No labelmap3D of labelmap index ${labelmapIndex} on stack.`);

    return;
  }

  const labelmap3D = brushStackState.labelmaps3D[labelmapIndex];
  const segmentsVisible = labelmap3D.segmentsVisible;

  const visible = segmentsVisible[segmentIndex];

  if (visible || visible === undefined) {
    segmentsVisible[segmentIndex] = false;
  } else {
    segmentsVisible[segmentIndex] = true;
  }

  return segmentsVisible[segmentIndex];
}

/**
 * SetCacheLabelMap2DView - Caches a `Labelmap2D` view of a `Labelmap3D`
 * for the given `imageIdIndex` if it doesn't yet exist.
 *
 * @param  {Labelmap3D} labelmap3D   The `Labelmap3D` object.
 * @param  {number} imageIdIndex The imageId Index.
 * @param  {number} rows         The number of rows.
 * @param  {number} columns      The number of columns.
 * @returns {null}
 */
function setCacheLabelMap2DView(labelmap3D, imageIdIndex, rows, columns) {
  if (labelmap3D.labelmaps2D[imageIdIndex]) {
    return;
  }

  const sliceLength = rows * columns;
  const byteOffset = sliceLength * 2 * imageIdIndex; // 2 bytes/pixel

  const pixelData = new Uint16Array(labelmap3D.buffer, byteOffset, sliceLength);

  labelmap3D.labelmaps2D[imageIdIndex] = {
    pixelData,
    getSegmentIndexes: () => new Set(pixelData),
    invalidated: true,
  };
}

/**
 * GetSegmentOfActiveLabelmapAtEvent - Returns the segment index
 * at the event position and its corresponding metadata.
 * @param  {Object} evt A cornerstone event with a currentPoints property.
 *
 * @returns {Object} An `Object` with the `segmentIndex` and its `metadata`.
 */
function getSegmentOfActiveLabelmapAtEvent(evt) {
  const eventData = evt.detail;
  const { element, image, currentPoints } = eventData;

  if (!currentPoints) {
    logger.warn('Not a cornerstone input event.');

    return;
  }

  const cols = image.width;
  const rows = image.height;

  if (!element) {
    return;
  }

  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];
  const currentImageIdIndex = stackData.currentImageIdIndex;
  const firstImageId = stackData.imageIds[0];
  const brushStackState = state.series[firstImageId];

  const activeLabelmapIndex = brushStackState.activeLabelmapIndex;

  const labelmap3D = brushStackState.labelmaps3D[activeLabelmapIndex];

  if (!labelmap3D) {
    // No labelmap3D === no segment here.
    return;
  }

  const labelmap2D = labelmap3D.labelmaps2D[currentImageIdIndex];

  if (!labelmap2D) {
    // No labelmap on this imageId === no segment here.
    return;
  }

  const pixelData = labelmap2D.pixelData;

  let { x, y } = currentPoints.image;

  x = Math.floor(x);
  y = Math.floor(y);

  if (pointInImage({ x, y }, rows, cols)) {
    const segmentIndex = pixelData[y * cols + x];

    if (segmentIndex === 0) {
      return;
    }

    return {
      segmentIndex,
      metadata: labelmap3D.metadata[segmentIndex],
    };
  }

  // Outside image === no segment here.
  return;
}

/**
 * GetLabelmapStats - returns the maximum pixel value, mean and standard
 * deviation of the segment given by the `segmentIndex` of the scan on the element.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @param  {number} segmentIndex  The segment index to query.
 * @returns {Promise} A promise that resolves to an object containing
 *                    the maximum pixel value, the mean and the standard deviation.
 */
function getLabelmapStats(elementOrEnabledElementUID, segmentIndex) {
  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  return new Promise(resolve => {
    const cornerstone = external.cornerstone;
    const stackState = getToolState(element, 'stack');
    const imageIds = stackState.data[0].imageIds;
    const firstImageId = imageIds[0];

    const brushStackState = state.series[firstImageId];

    if (!brushStackState) {
      resolve();
    }

    const activeLabelmapIndex = brushStackState.activeLabelmapIndex;
    const labelmap3D = brushStackState.labelmaps3D[activeLabelmapIndex];
    const labelmap3Dbuffer = labelmap3D.buffer;

    const imagePromises = [];

    for (let i = 0; i < imageIds.length; i++) {
      imagePromises.push(cornerstone.loadAndCacheImage(imageIds[i]));
    }

    Promise.all(imagePromises).then(images => {
      const imagePixelData = [];

      const { rows, columns } = images[0];

      for (let i = 0; i < images.length; i++) {
        imagePixelData.push(images[i].getPixelData());
      }

      const stats = labelmapStats(
        labelmap3Dbuffer,
        imagePixelData,
        rows * columns,
        segmentIndex
      );

      resolve(stats);
    });
  });
}

/**
 * GetBrushColor - Returns the brush color as a rgba CSS color
 * for the active segment of the active `Labelmap3D` for the `BrushStackState`
 * displayed on the element.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @param  {boolean} drawing = false    Whether the user is drawing or not.
 * @returns {string}                    An rgba value as a string.
 */
function getBrushColor(elementOrEnabledElementUID, drawing = false) {
  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];
  const firstImageId = stackData.imageIds[0];

  const brushStackState = state.series[firstImageId];

  let color;

  if (brushStackState) {
    const activeLabelmapIndex = brushStackState.activeLabelmapIndex;
    const labelmap3D = brushStackState.labelmaps3D[activeLabelmapIndex];

    if (labelmap3D) {
      const activeSegmentIndex = labelmap3D.activeSegmentIndex;

      color =
        state.colorLutTables[`${state.colorMapId}_${activeLabelmapIndex}`][
          activeSegmentIndex
        ];
    } else {
      // Just set to new labelmap index
    }
  } else {
    // No data yet, make brush the default color of colormap 0.
    color = state.colorLutTables[`${state.colorMapId}_0`][1];
  }

  return drawing
    ? `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1.0 )`
    : `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.8 )`;
}

/**
 * GetActiveSegmentIndex - Returns the `activeSegmentIndex` for the
 * active `Labelmap3D` for the `BrushStackState` displayed on the element.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @param  {number} [labelmapIndex] The labelmap index, defaults to the active labelmap index.
 * @returns {number}                                  The active segment index.
 */
function getActiveSegmentIndex(elementOrEnabledElementUID, labelmapIndex) {
  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];
  const firstImageId = stackData.imageIds[0];

  const brushStackState = state.series[firstImageId];

  if (brushStackState) {
    if (labelmapIndex === undefined) {
      labelmapIndex = brushStackState.activeLabelmapIndex;
    }

    const labelmap3D = brushStackState.labelmaps3D[labelmapIndex];

    if (labelmap3D) {
      return labelmap3D.activeSegmentIndex;
    }
  }

  return 1;
}

/**
 * GetLabelmapBuffers - Returns the `buffer` of each `Labelmap3D` associated
 *                      with the `BrushStackState` displayed on the element, or a specific
 *                      one if `labelmapIndex` is defined.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @param {type} [labelmapIndex] Optional filtering to only return one labelmap.
 * @returns {Object|Object[]} An array of objects containing the `labelmapIndex` and
 *                        corresponding `buffer`. Only one object if `labelmapIndex` was specified.
 *
 */
function getLabelmapBuffers(elementOrEnabledElementUID, labelmapIndex) {
  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const { labelmaps3D } = getLabelmaps3D(element);

  if (!labelmaps3D) {
    return [];
  }

  if (labelmapIndex !== undefined) {
    if (labelmaps3D[labelmapIndex]) {
      return {
        labelmapIndex,
        bytesPerVoxel: 2,
        buffer: labelmaps3D[labelmapIndex].buffer,
      };
    }

    return;
  }

  const labelmapBuffers = [];

  for (let i = 0; i < labelmaps3D.length; i++) {
    if (labelmaps3D[i]) {
      labelmapBuffers.push({
        labelmapIndex: i,
        bytesPerVoxel: 2,
        buffer: labelmaps3D[i].buffer,
      });
    }
  }

  return labelmapBuffers;
}

/**
 * GetActiveLabelmapBuffer - Returns the `buffer` corresponding to the active
 *                           `Labelmap3D` associated with the `BrushStackState` displayed on
 *                           the element.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @returns {Object}      An object containing the `labelmapIndex` and
 *                        corresponding `buffer`.
 */
function getActiveLabelmapBuffer(elementOrEnabledElementUID) {
  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const stackState = getToolState(element, 'stack');
  const imageIds = stackState.data[0].imageIds;
  const firstImageId = imageIds[0];

  const brushStackState = state.series[firstImageId];

  if (!brushStackState) {
    return;
  }

  const activeLabelmapIndex = brushStackState.activeLabelmapIndex;

  return getLabelmapBuffers(element, activeLabelmapIndex);
}

/**
 * SetMetadata - Sets the metadata object for a particular segment of a
 * `Labelmap3D`.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @param  {number} labelmapIndex = 0 The labelmap index.
 * @param  {number} segmentIndex      The segment index.
 * @param  {Object} metadata          The metadata object to set.
 * @returns {null}
 */
function setMetadata(
  elementOrEnabledElementUID,
  labelmapIndex = 0,
  segmentIndex,
  metadata
) {
  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const cornerstone = external.cornerstone;
  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];
  const firstImageId = stackData.imageIds[0];

  let brushStackState = state.series[firstImageId];

  if (!brushStackState) {
    state.series[firstImageId] = {
      labelmapIndex,
      labelmaps3D: [],
    };

    brushStackState = state.series[firstImageId];
  }

  if (!brushStackState.labelmaps3D[labelmapIndex]) {
    const enabledElement = cornerstone.getEnabledElement(element);

    const { rows, columns } = enabledElement.image;
    const numberOfFrames = stackData.imageIds.length;

    _addLabelmap3D(
      brushStackState,
      labelmapIndex,
      rows * columns * numberOfFrames
    );
  }

  const labelmap3D = brushStackState.labelmaps3D[labelmapIndex];

  labelmap3D.metadata[segmentIndex] = metadata;
}

/**
 * SetLabelmap3DForElement - Takes an 16-bit encoded `ArrayBuffer` and stores
 * it as a `Labelmap3D` for the `BrushStackState` associated with the element.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID The cornerstone
 *                                                  enabled element or its UUID.
 * @param  {ArrayBuffer} buffer
 * @param  {number} labelmapIndex The index to store the labelmap under.
 * @param  {Object[]} metadata = [] Any metadata about the segments.
 * @returns {null}
 */
function setLabelmap3DForElement(
  elementOrEnabledElementUID,
  buffer,
  labelmapIndex,
  metadata = []
) {
  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const stackState = getToolState(element, 'stack');
  const numberOfFrames = stackState.data[0].imageIds.length;
  const firstImageId = stackState.data[0].imageIds[0];

  setLabelmap3DByFirstImageId(
    firstImageId,
    buffer,
    labelmapIndex,
    metadata,
    numberOfFrames
  );

  if (element) {
    external.cornerstone.triggerEvent(element, EVENTS.LABELMAP_MODIFIED, {
      labelmapIndex,
    });
  }
}

/**
 * SetLabelmap3DForElement - Takes an 16-bit encoded `ArrayBuffer` and stores
 * it as a `Labelmap3D` for the `BrushStackState` associated with the firstImageId.
 *
 * @param  {HTMLElement|string} firstImageId  The firstImageId of the series to
 *                                            store the segmentation on.
 * @param  {ArrayBuffer} buffer
 * @param  {number} labelmapIndex The index to store the labelmap under.
 * @param  {Object[]} metadata = [] Any metadata about the segments.
 * @param  {number} numberOfFrames The number of frames, required to set up the
 *                                 relevant labelmap2D views.
 * @returns {null}
 */
function setLabelmap3DByFirstImageId(
  firstImageId,
  buffer,
  labelmapIndex,
  metadata = [],
  numberOfFrames
) {
  let brushStackState = state.series[firstImageId];

  if (!brushStackState) {
    state.series[firstImageId] = {
      labelmapIndex,
      labelmaps3D: [],
    };

    brushStackState = state.series[firstImageId];
  }

  brushStackState.labelmaps3D[labelmapIndex] = {
    buffer,
    labelmaps2D: [],
    metadata,
    activeSegmentIndex: 1,
    segmentsVisible: [],
  };

  const labelmaps2D = brushStackState.labelmaps3D[labelmapIndex].labelmaps2D;

  const slicelengthInBytes = buffer / numberOfFrames;
  const sliceLengthInUint16 = slicelengthInBytes / 2; // SliceLength in Uint16.

  for (let i = 0; i < numberOfFrames; i++) {
    const pixelData = new Uint16Array(
      buffer,
      slicelengthInBytes * i,
      sliceLengthInUint16
    );

    const segmentsOnLabelmap = _getSegmentsOnPixelData(pixelData);

    if (segmentsOnLabelmap.some(segment => !segment)) {
      labelmaps2D[i] = {
        pixelData,
        segmentsOnLabelmap: [],
        invalidated: true,
      };
    }
  }
}

/**
 * SetDeleteSegment - Deletes the segment and any associated metadata from
 *                    the `Labelmap3D`.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID The cornerstone enabled element
 *                                           or its UUID.
 * @param  {number} segmentIndex     The segment Index
 * @param  {number} [labelmapIndex]  The labelmap index. Defaults to the active labelmap index.
 *
 * @returns {null}
 */
function setDeleteSegment(
  elementOrEnabledElementUID,
  segmentIndex,
  labelmapIndex
) {
  if (!segmentIndex) {
    return;
  }

  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];
  const currentImageIdIndex = stackData.currentImageIdIndex;
  const firstImageId = stackData.imageIds[0];

  const brushStackState = state.series[firstImageId];

  if (!brushStackState) {
    return;
  }

  if (labelmapIndex === undefined) {
    labelmapIndex = brushStackState.activeLabelmapIndex;
  }

  const labelmap3D = brushStackState.labelmaps3D[labelmapIndex];

  if (!labelmap3D) {
    return;
  }

  // Delete metadata if present.
  delete labelmap3D.metadata[segmentIndex];

  const labelmaps2D = labelmap3D.labelmaps2D;

  // Clear segment's voxels.
  for (let i = 0; i < labelmaps2D.length; i++) {
    const labelmap2D = labelmaps2D[i];

    // If the labelmap2D has data, and it contains the segment, delete it.
    if (labelmap2D && labelmap2D.segmentsOnLabelmap.includes(segmentIndex)) {
      const pixelData = labelmap2D.pixelData;

      // Remove this segment from the list.
      const indexOfSegment = labelmap2D.segmentsOnLabelmap.indexOf(
        segmentIndex
      );

      labelmap2D.segmentsOnLabelmap.splice(indexOfSegment, 1);
      labelmap2D.invalidated = true;

      // Delete the label for this segment.
      for (let p = 0; p < pixelData.length; p++) {
        if (pixelData[p] === segmentIndex) {
          pixelData[p] = 0;
        }
      }
    }
  }

  external.cornerstone.updateImage(element);
}

/**
 * GetActiveLabelmapIndex - Returns the index of the active `Labelmap3D`.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID The cornerstone
 *                                            enabled element or its UUID.
 * @returns {number} The index of the active `Labelmap3D`.
 */
function getActiveLabelmapIndex(elementOrEnabledElementUID) {
  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];
  const firstImageId = stackData.imageIds[0];

  const brushStackState = state.series[firstImageId];

  if (!brushStackState) {
    return;
  }

  return brushStackState.activeLabelmapIndex;
}

/**
 * GetActiveCornerstoneColorMap - Returns the cornerstone colormap for the active
 * labelmap.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID The cornerstone enabled element
 *                                           or its UUID.
 * @returns {Object}                         The cornerstone colormap.
 */
function getActiveCornerstoneColorMap(elementOrEnabledElementUID) {
  const activeLabelmapIndex = getActiveLabelmapIndex(
    elementOrEnabledElementUID
  );

  const colorMapId = `${state.colorMapId}_${activeLabelmapIndex}`;

  return external.cornerstone.colors.getColormap(colorMapId);
}

/**
 * SetActiveLabelmap - Sets the active `Labelmap3D` for the `BrushStackState` displayed on this
 * element to the `Labelmap3D` given by the `labelmapIndex`. Creates the `Labelmap3D` if
 * it doesn't exist.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @param  {number} labelmapIndex = 0 The index of the labelmap.
 * @returns {null}
 */
function setActiveLabelmap(elementOrEnabledElementUID, labelmapIndex = 0) {
  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const cornerstone = external.cornerstone;
  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];
  const enabledElement = cornerstone.getEnabledElement(element);
  const { rows, columns } = enabledElement.image;
  const numberOfFrames = stackData.imageIds.length;
  const firstImageId = stackData.imageIds[0];

  let brushStackState = state.series[firstImageId];

  if (!state.colorLutTables[`${state.colorMapId}_${labelmapIndex}`]) {
    setColorLUT(labelmapIndex);
  }

  if (brushStackState) {
    brushStackState.activeLabelmapIndex = labelmapIndex;

    if (!brushStackState.labelmaps3D[labelmapIndex]) {
      _addLabelmap3D(
        brushStackState,
        labelmapIndex,
        rows * columns * numberOfFrames
      );
    }
  } else {
    state.series[firstImageId] = {
      activeLabelmapIndex: labelmapIndex,
      labelmaps3D: [],
    };

    brushStackState = state.series[firstImageId];

    _addLabelmap3D(
      brushStackState,
      labelmapIndex,
      rows * columns * numberOfFrames
    );
  }

  cornerstone.updateImage(element);
}

/**
 * SetIncrementActiveSegmentIndex - Increment the `activeSegmentIndex` for the
 *                                  active `Labelmap3D` on the element.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @returns {null}
 */
function setIncrementActiveSegmentIndex(elementOrEnabledElementUID) {
  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  _changeActiveSegmentIndex(element, 'increase');
}

/**
 * SetDecrementActiveSegmentIndex - Decrement the `activeSegmentIndex` for the
 *                                  active `Labelmap3D` on the element.
 *
 * @param  {HTMLElement} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @returns {null}
 */
function setDecrementActiveSegmentIndex(elementOrEnabledElementUID) {
  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  _changeActiveSegmentIndex(element, 'decrease');
}

/**
 * SetActiveSegmentIndex - Sets the `activeSegmentIndex` for the active `Labelmap3D`
 *                         on the element.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @param {number}  segmentIndex The segmentIndex to set active.
 * @returns {null}
 */
function setActiveSegmentIndex(elementOrEnabledElementUID, segmentIndex) {
  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];
  const firstImageId = stackData.imageIds[0];

  const brushStackState = state.series[firstImageId];

  if (!brushStackState) {
    return;
  }

  const activeLabelmapIndex = brushStackState.activeLabelmapIndex;
  const labelmap3D = brushStackState.labelmaps3D[activeLabelmapIndex];

  if (segmentIndex <= 0) {
    segmentIndex = 1;
  } else if (segmentIndex > state.segmentsPerLabelmap) {
    segmentIndex = state.segmentsPerLabelmap;
  }

  labelmap3D.activeSegmentIndex = segmentIndex;
}

/**
 * SetUpdateSegmentsOnLabelmaps2D - Updates the `segmentsOnLabelmap` for the `Labelmap2D`.
 * @param  {Labelmap2D} labelmap2D The `Labelmap2D` object.
 */
function setUpdateSegmentsOnLabelmaps2D(labelmap2D) {
  labelmap2D.segmentsOnLabelmap = _getSegmentsOnPixelData(labelmap2D.pixelData);
}

/**
 * Invalidate all the brush data for a `Labelmap3D`. Useful if multiple libraries
 * are writting to the same labelmap.
 *
 * @param {HTMLElement|string} elementOrEnabledElementUID - The cornerstone enabled
 *                                                    element or its UUID.
 * @param {number} [labelmapIndex] - The labelmap index, defaults to the `activeLabelmapIndex`.
 * @returns {null}
 */
function invalidateBrushOnEnabledElement(
  elementOrEnabledElementUID,
  labelmapIndex
) {
  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const { labelmaps3D } = getLabelmaps3D(element);

  labelmapIndex =
    labelmapIndex !== undefined
      ? labelmapIndex
      : labelmaps3D.activeLabelmapIndex;

  const labelmap3D = labelmaps3D[labelmaps3D.activeLabelmapIndex];

  if (!labelmap3D) {
    return;
  }

  labelmap3D.labelmaps2D.forEach(labelmap2D => {
    labelmap2D.invalidated = true;
  });

  external.cornerstone.updateImage(element, true);
}

/**
 * SetColorLUT - Sets the labelmap to a specfic LUT, or generates a new LUT.
 *
 * @param  {number} labelmapIndex The labelmap index to apply the color LUT to.
 * @param  {number[][]} [colorLUT]    An array of The colorLUT to set.
 * @returns {null}
 */
function setColorLUT(labelmapIndex, colorLUT) {
  const colorMapId = `${state.colorMapId}_${labelmapIndex}`;
  const colormap = external.cornerstone.colors.getColormap(colorMapId);
  const segmentsPerLabelmap = configuration.segmentsPerLabelmap;

  if (!_validColorLUTLength(colorLUT, segmentsPerLabelmap)) {
    return;
  }

  if (colorLUT && colorLUT.length !== segmentsPerLabelmap) {
    logger.warn('The labelmap being set is not the same');
  }

  colormap.setNumberOfColors(segmentsPerLabelmap + 1);

  colorLUT = colorLUT || getNewColorLUT(segmentsPerLabelmap);

  // Apppend the "zero" (no label) color to the front of the LUT.
  colorLUT = [[0, 0, 0, 0], ...colorLUT];

  for (let i = 0; i <= segmentsPerLabelmap; i++) {
    colormap.setColor(i, colorLUT[i]);
  }

  state.colorLutTables[colorMapId] = colorLUT;
}

/**
 * _validColorLUTLength - Checks if the length of the colorLUT is sufficient.
 * @param  {number[][]} colorLUT
 * @param  {number} segmentsPerLabelmap
 */
function _validColorLUTLength(colorLUT, segmentsPerLabelmap) {
  if (colorLUT) {
    if (colorLUT.length < segmentsPerLabelmap) {
      logger.error(
        `The provided colorLUT only provides ${
          colorLUT.length
        } labels, whereas segmentsPerLabelmap is set to ${segmentsPerLabelmap}.`
      );

      return false;
    } else if (colorLUT.length > segmentsPerLabelmap) {
      logger.warn(
        `segmentsPerLabelmap is set to ${segmentsPerLabelmap}, and the provided colorLUT provides ${
          colorLUT.length
        }. Using the first ${segmentsPerLabelmap} colors from the LUT.`
      );
    }
  }

  return true;
}

/**
 * Sets the brush radius, gated by `configuration.minRadius` and `configuration.maxRadius`.
 *
 * @param {number} radius
 * @returns {null}
 */
function setRadius(radius) {
  configuration.radius = Math.min(
    Math.max(radius, configuration.minRadius),
    configuration.maxRadius
  );
}

/**
 * OnRegisterCallback - Initialise a single default colorLUT when cornerstone
 * is initialised.
 *
 * @returns {null}
 */
function onRegisterCallback() {
  setColorLUT(0);
}

export default {
  state,
  configuration,
  onRegisterCallback,
  getters: {
    metadata: getMetadata,
    labelmaps3D: getLabelmaps3D,
    activeLabelmapIndex: getActiveLabelmapIndex,
    activeSegmentIndex: getActiveSegmentIndex,
    isSegmentVisible: getIsSegmentVisible,
    getAndCacheLabelmap2D,
    labelmapStats: getLabelmapStats,
    segmentOfActiveLabelmapAtEvent: getSegmentOfActiveLabelmapAtEvent,
    brushColor: getBrushColor,
    activeCornerstoneColorMap: getActiveCornerstoneColorMap,
    labelmapBuffers: getLabelmapBuffers,
    activeLabelmapBuffer: getActiveLabelmapBuffer,
  },
  setters: {
    metadata: setMetadata,
    labelmap3DForElement: setLabelmap3DForElement,
    labelmap3DByFirstImageId: setLabelmap3DByFirstImageId,
    incrementActiveSegmentIndex: setIncrementActiveSegmentIndex,
    decrementActiveSegmentIndex: setDecrementActiveSegmentIndex,
    cacheLabelMap2DView: setCacheLabelMap2DView,
    activeSegmentIndex: setActiveSegmentIndex,
    toggleSegmentVisibility: setToggleSegmentVisibility,
    updateSegmentsOnLabelmaps2D: setUpdateSegmentsOnLabelmaps2D,
    deleteSegment: setDeleteSegment,
    colorLUT: setColorLUT,
    activeLabelmap: setActiveLabelmap,
    radius: setRadius,
    invalidateBrushOnEnabledElement,
  },
};

/**
 * _getEnabledElement - Returns the enabledElement given either the enabledElement
 *                      or its UUID.
 *
 * @param  {string|HTMLElement} elementOrEnabledElementUID  The enabledElement
 *                                                          or its UUID.
 * @returns {HTMLElement}
 */
function _getEnabledElement(elementOrEnabledElementUID) {
  if (elementOrEnabledElementUID instanceof HTMLElement) {
    return elementOrEnabledElementUID;
  }

  return storeGetters.enabledElementByUID(elementOrEnabledElementUID);
}

/**
 * _getSegmentsOnPixelData - Returns a list of the segment indicies present
 * one the `pixelData`.
 * @param  {UInt16Array} pixelData The pixel data array.
 */
function _getSegmentsOnPixelData(pixelData) {
  const segmentSet = new Set(pixelData);
  const iterator = segmentSet.values();

  const segmentsOnLabelmap = [];
  let done = false;

  while (!done) {
    const next = iterator.next();

    done = next.done;

    if (!done) {
      segmentsOnLabelmap.push(next.value);
    }
  }

  return segmentsOnLabelmap;
}

/**
 * _changeActiveSegmentIndex - Changes the `activeSegmentIndex` for the active
 *                             `Labelmap3D` on the element.
 *
 * @param  {HTMLElement} element  The cornerstone enabled element.
 * @param  {string} increaseOrDecrease = Whether to increase/decrease the activeLabelmapIndex.
 * @returns {null}
 */
function _changeActiveSegmentIndex(element, increaseOrDecrease = 'increase') {
  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];
  const firstImageId = stackData.imageIds[0];

  const brushStackState = state.series[firstImageId];

  if (!brushStackState) {
    return;
  }

  const activeLabelmapIndex = brushStackState.activeLabelmapIndex;
  const labelmap3D = brushStackState.labelmaps3D[activeLabelmapIndex];

  switch (increaseOrDecrease) {
    case 'increase':
      labelmap3D.activeSegmentIndex++;

      if (labelmap3D.activeSegmentIndex > state.segmentsPerLabelmap) {
        labelmap3D.activeSegmentIndex = 1;
      }
      break;
    case 'decrease':
      labelmap3D.activeSegmentIndex--;

      if (labelmap3D.activeSegmentIndex <= 0) {
        labelmap3D.activeSegmentIndex = state.segmentsPerLabelmap;
      }
      break;
  }
}

/**
 * _addLabelmap3D - Adds a `Labelmap3D` object to the `BrushStackState` object.
 *
 * @param  {BrushStackState} brushStackState The labelmap state for a particular stack.
 * @param  {number} labelmapIndex   The labelmapIndex to set.
 * @param  {number} size            The size of the ArrayBuffer in bytes/ 2.
 * @returns {null}
 */
function _addLabelmap3D(brushStackState, labelmapIndex, size) {
  logger.warn('hmm..');
  logger.warn(size);

  // Buffer size is multiplied by 2 as we are using 2 bytes/voxel for 65536 segments.
  brushStackState.labelmaps3D[labelmapIndex] = {
    buffer: new ArrayBuffer(size * 2),
    labelmaps2D: [],
    metadata: [],
    activeSegmentIndex: 1,
    segmentsVisible: [],
  };
}

/**
 * _addLabelmap2DView - Adds a `Labelmap2D` view of one frame of a `Labelmap3D`.
 *
 * @param  {BrushStackState} brushStackState     The `BrushStackState` for a particular `Series`.
 * @param  {number} labelmapIndex       The labelmap index.
 * @param  {number} imageIdIndex        The stack position of the image.
 * @param  {number} rows                The number of rows in the image.
 * @param  {number} columns             The number of columns in the image.
 * @returns {null}
 */
function _addLabelmap2DView(
  brushStackState,
  labelmapIndex,
  imageIdIndex,
  rows,
  columns
) {
  const sliceLength = rows * columns;
  const byteOffset = sliceLength * 2 * imageIdIndex; // 2 bytes/pixel

  const pixelData = new Uint16Array(
    brushStackState.labelmaps3D[labelmapIndex].buffer,
    byteOffset,
    sliceLength
  );

  brushStackState.labelmaps3D[labelmapIndex].labelmaps2D[imageIdIndex] = {
    pixelData,
    segmentsOnLabelmap: [],
    invalidated: true,
  };
}
