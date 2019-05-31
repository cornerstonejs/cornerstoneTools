import external from './../../externalModules.js';
import { getToolState } from '../../stateManagement/toolState.js';
import getNewBrushColorMap from '../../util/brush/getNewBrushColorMap.js';

import { getLogger } from '../../util/logger.js';

const logger = getLogger('store:modules:brushModule');

const state = {
  colorLutTables: {},
  radius: 10,
  minRadius: 1,
  maxRadius: 50,
  alpha: 0.4,
  renderBrushIfHiddenButActive: true, // TODO - We aren't currently using this.
  colorMapId: 'BrushColorMap',
  visibleSegmentations: {}, // TODO - We aren't currently using this.
  segmentationMetadata: {},
  series: {},
};

/**
 * getLabelMapStats - returns the maximum pixel value, mean and standard
 * deviation of the segment given by the segmentIndex of the scan on the element.
 *
 * @param  {HTMLElement} element  The cornerstone enabled element.
 * @param  {Number} segmentIndex  The segment index to query.
 * @returns {object}              An object containing the maximum pixel value,
 *                                the mean and the standard deviation.
 */
function getLabelMapStats(element, segmentIndex) {
  return new Promise(resolve => {
    const cornerstone = external.cornerstone;
    const stackState = getToolState(element, 'stack');
    const stackData = stackState.data[0];
    const imageIds = stackState.data[0].imageIds;
    const firstImageId = imageIds[0];

    const brushStackState = state.series[firstImageId];

    if (!brushStackState) {
      resolve();
    }

    const activeLabelMapIndex = brushStackState.activeLabelMapIndex;
    const labelmap3D = brushStackState.labelmaps3D[activeLabelMapIndex];
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

      logger.warn(imagePixelData);

      const labelmapStats = _labelMapStats(
        labelmap3Dbuffer,
        imagePixelData,
        rows * columns,
        segmentIndex
      );
      resolve(labelmapStats);
    });
  });
}

/**
 * _labelMapStats - description
 *
 * @param  {type} labelMapBuffer The buffer for the labelmap.
 * @param  {Number[][]} imagePixelData The pixeldata of each image slice.
 * @param  {Number} sliceLength    The number of pixels in one slice.
 * @param  {Number} segmentIndex   The index of the segment.
 * @returns {Promise} A promise that resolves to the stats.
 */
function _labelMapStats(
  labelMapBuffer,
  imagePixelData,
  sliceLength,
  segmentIndex
) {
  let maximum = 0;
  let count = 0;
  let total = 0;
  let meanOfSquares = 0;

  for (let img = 0; img < imagePixelData.length; img++) {
    const Uint8SliceView = new Uint8Array(
      labelMapBuffer,
      img * sliceLength,
      sliceLength
    );
    const image = imagePixelData[img];

    for (let ind = 0; ind < image.length; ind++) {
      if (Uint8SliceView[ind] == segmentIndex) {
        if (image[ind] > maximum) {
          maximum = image[ind];
        }
        total += image[ind];
        count += 1;
        meanOfSquares += image[ind] ** 2;
      }
    }
  }
  let mean = total / count;
  let stdDev = (meanOfSquares / count - mean ** 2) ** 0.5;

  return {
    maximum,
    mean,
    stdDev,
  };
}

function getBrushColor(element, drawing = false) {
  const cornerstone = external.cornerstone;
  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];
  const firstImageId = stackData.imageIds[0];

  const brushStackState = state.series[firstImageId];

  let color;

  if (brushStackState) {
    const activeLabelMapIndex = brushStackState.activeLabelMapIndex;
    const labelmap3D = brushStackState.labelmaps3D[activeLabelMapIndex];

    color = labelmap3D.activeDrawColorId;
  } else {
    // No data yet, make brush the default color of colormap 0.
    color = state.colorLutTables[`${state.colorMapId}_0`][1];
  }

  return drawing
    ? `rgba(${color[[0]]}, ${color[[1]]}, ${color[[2]]}, 1.0 )`
    : `rgba(${color[[0]]}, ${color[[1]]}, ${color[[2]]}, 0.8 )`;
}

function _changeBrushColor(element, increaseOrDecrease = 'increase') {
  const cornerstone = external.cornerstone;
  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];
  const firstImageId = stackData.imageIds[0];

  const brushStackState = state.series[firstImageId];

  if (!brushStackState) {
    return;
  }

  const activeLabelMapIndex = brushStackState.activeLabelMapIndex;
  const labelmap3D = brushStackState.labelmaps3D[activeLabelMapIndex];

  switch (increaseOrDecrease) {
    case 'increase':
      labelmap3D.activeDrawColorId++;

      if (labelmap3D.activeDrawColorId > segmentsPerLabelMap) {
        labelmap3D.activeDrawColorId = 1;
      }
      break;
    case 'decrease':
      labelmap3D.activeDrawColorId--;

      if (labelmap3D.activeDrawColorId <= 0) {
        labelmap3D.activeDrawColorId = segmentsPerLabelMap;
      }
      break;
  }
}

function getLabelMaps3DForElement(element) {
  const cornerstone = external.cornerstone;
  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];

  const enabledElement = cornerstone.getEnabledElement(element);

  const currentImageIdIndex = stackData.currentImageIdIndex;
  const { rows, columns } = enabledElement.image;
  const numberOfFrames = stackData.imageIds.length;
  const firstImageId = stackData.imageIds[0];

  let brushStackState = state.series[firstImageId];

  let labelmaps3D;

  if (brushStackState) {
    labelmaps3D = brushStackState.labelmaps3D;
  }

  return {
    labelmaps3D,
    currentImageIdIndex,
  };
}

function getAndCacheLabelMap2D(element, labelMapIndex = 0) {
  const cornerstone = external.cornerstone;
  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];

  const enabledElement = cornerstone.getEnabledElement(element);

  const currentImageIdIndex = stackData.currentImageIdIndex;
  const { rows, columns } = enabledElement.image;
  const numberOfFrames = stackData.imageIds.length;
  const firstImageId = stackData.imageIds[0];

  let brushStackState = state.series[firstImageId];

  if (brushStackState) {
    if (!brushStackState.labelmaps3D[labelMapIndex]) {
      addLabelMap3D(
        brushStackState,
        labelMapIndex,
        rows * columns * numberOfFrames
      );
    }

    if (
      !brushStackState.labelmaps3D[labelMapIndex].labelmaps2D[
        currentImageIdIndex
      ]
    ) {
      addLabelMap2DView(
        brushStackState,
        labelMapIndex,
        currentImageIdIndex,
        rows,
        columns
      );
    }
  } else {
    state.series[firstImageId] = {
      activeLabelMapIndex: labelMapIndex,
      labelmaps3D: [],
    };

    brushStackState = state.series[firstImageId];

    addLabelMap3D(
      brushStackState,
      labelMapIndex,
      rows * columns * numberOfFrames
    );

    addLabelMap2DView(
      brushStackState,
      labelMapIndex,
      currentImageIdIndex,
      rows,
      columns
    );
  }

  return {
    labelmap3D: brushStackState.labelmaps3D[labelMapIndex],
    currentImageIdIndex,
  };
}

function addLabelMap3D(brushStackState, labelMapIndex, size) {
  brushStackState.labelmaps3D[labelMapIndex] = {
    buffer: new ArrayBuffer(size),
    labelmaps2D: [],
    activeDrawColorId: 1,
    imageBitmapCache: null,
  };
}

function addLabelMap2DView(
  brushStackState,
  labelMapIndex,
  currentImageIdIndex,
  rows,
  columns
) {
  brushStackState.labelmaps3D[labelMapIndex].labelmaps2D[
    currentImageIdIndex
  ] = {
    pixelData: new Uint8Array(
      brushStackState.labelmaps3D[labelMapIndex].buffer,
      currentImageIdIndex * rows * columns,
      rows * columns
    ),
    invalidated: true,
  };
  // Clear cache for this displaySet to avoid flickering.
  brushStackState.labelmaps3D[labelMapIndex].imageBitmapCache = null;
}

/**
 * Sets the brush radius, account for global min/max radius
 *
 * @param {number} radius
 * @returns {void}
 */
function setRadius(radius) {
  state.radius = Math.min(Math.max(radius, state.minRadius), state.maxRadius);
}

/**
 * TODO: Should this be a init config property?
 * Sets the brush color map to something other than the default
 *
 * @param  {Array} colors An array of 4D [red, green, blue, alpha] arrays.
 * @returns {void}
 */
function setBrushColorMap(colors) {
  const colormap = external.cornerstone.colors.getColormap(state.colorMapId);

  colormap.setNumberOfColors(colors.length);

  for (let i = 0; i < colors.length; i++) {
    colormap.setColor(i, colors[i]);
  }
}
function setElementVisible(enabledElement) {
  if (!external.cornerstone) {
    return;
  }

  const cornerstoneEnabledElement = external.cornerstone.getEnabledElement(
    enabledElement
  );

  const enabledElementUID = cornerstoneEnabledElement.uuid;
  const colormap = external.cornerstone.colors.getColormap(state.colorMapId);
  const numberOfColors = colormap.getNumberOfColors();

  state.visibleSegmentations[enabledElementUID] = [];

  for (let i = 0; i < numberOfColors; i++) {
    state.visibleSegmentations[enabledElementUID].push(true);
  }
}

function getVisibleSegmentationsForElement(enabledElementUID) {
  if (!state.visibleSegmentations[enabledElementUID]) {
    return null;
  }

  return state.visibleSegmentations[enabledElementUID];
}

function setBrushVisibilityForElement(
  enabledElementUID,
  segIndex,
  visible = true
) {
  if (!state.visibleSegmentations[enabledElementUID]) {
    state.imageBitmapCache[enabledElementUID] = [];
  }

  state.visibleSegmentations[enabledElementUID][segIndex] = visible;
}

function getImageBitmapCacheForElement(enabledElementUID) {
  if (!state.imageBitmapCache[enabledElementUID]) {
    return null;
  }

  return state.imageBitmapCache[enabledElementUID];
}

function setImageBitmapCacheForElement(
  enabledElementUID,
  segIndex,
  imageBitmap
) {
  if (!state.imageBitmapCache[enabledElementUID]) {
    state.imageBitmapCache[enabledElementUID] = [];
  }

  state.imageBitmapCache[enabledElementUID][segIndex] = imageBitmap;
}

function clearImageBitmapCacheForElement(enabledElementUID) {
  state.imageBitmapCache[enabledElementUID] = [];
}

/**
 * Retrieves series-specific brush segmentation metadata.
 * @public
 * @function metadata
 * @param {string} seriesInstanceUid - The seriesInstanceUid of the scan.
 * @param {number} [segIndex] - The segmentation index.
 *
 * @returns {Object[]|Object} An array of segmentation metadata, or specifc
 *                            segmentation data if segIndex is defined.
 */
function getMetadata(seriesInstanceUid, segIndex) {
  if (!state.segmentationMetadata[seriesInstanceUid]) {
    return;
  }

  if (segIndex !== undefined) {
    return state.segmentationMetadata[seriesInstanceUid][segIndex];
  }

  return state.segmentationMetadata[seriesInstanceUid];
}

function setMetadata(seriesInstanceUid, segIndex, metadata) {
  if (!state.segmentationMetadata[seriesInstanceUid]) {
    state.segmentationMetadata[seriesInstanceUid] = [];
  }

  state.segmentationMetadata[seriesInstanceUid][segIndex] = metadata;
}

const getters = {
  imageBitmapCacheForElement: getImageBitmapCacheForElement,
  visibleSegmentationsForElement: getVisibleSegmentationsForElement,
  metadata: getMetadata,
  getAndCacheLabelMap2D: getAndCacheLabelMap2D,
  labelMaps3DForElement: getLabelMaps3DForElement,
  brushColor: getBrushColor,
};

const setters = {
  brushColorMap: setBrushColorMap,
  elementVisible: setElementVisible,
  brushVisibilityForElement: setBrushVisibilityForElement,
  imageBitmapCacheForElement: setImageBitmapCacheForElement,
  clearImageBitmapCacheForElement: clearImageBitmapCacheForElement,
  metadata: setMetadata,
  incrementBrushColor: element => {
    _changeBrushColor(element, 'increase');
  },
  decrementBrushColor: element => {
    _changeBrushColor(element, 'decrease');
  },
};

/**
 * EnabledElementCallback - Element specific initilisation.
 * @public
 * @param  {Object} enabledElement - The element on which the module is
 *                                  being initialised.
 * @returns {void}
 */
function enabledElementCallback(enabledElement) {
  setters.elementVisible(enabledElement);
}

/**
 * RemoveEnabledElementCallback - Element specific memory cleanup.
 * @public
 * @param  {Object} enabledElement  The element being removed.
 * @returns {void}
 */
// TODO -> Test this before adding it to the module.
function removeEnabledElementCallback(enabledElement) {
  if (!external.cornerstone) {
    return;
  }

  const cornerstoneEnabledElement = external.cornerstone.getEnabledElement(
    enabledElement
  );

  const enabledElementUID = cornerstoneEnabledElement.uuid;

  // Remove enabledElement specific data.
  delete state.visibleSegmentations[enabledElementUID];
  delete state.imageBitmapCache[enabledElementUID];
}

/**
 * OnRegisterCallback - Initialise the module when a new element is added.
 * @public
 * @returns {void}
 */
function onRegisterCallback() {
  initColorMap(0);
}

export default {
  state,
  onRegisterCallback,
  enabledElementCallback,
  getters,
  setters,
};

const segmentsPerLabelMap = 255;

/**
 * initColorMap - description
 *
 * @param  {type} labelMapIndex description
 * @returns {type}               description
 */
function initColorMap(labelMapIndex) {
  const colorMapId = `${state.colorMapId}_${labelMapIndex}`;
  const colormap = external.cornerstone.colors.getColormap(colorMapId);

  colormap.setNumberOfColors(segmentsPerLabelMap);

  const newColormap = getNewBrushColorMap(segmentsPerLabelMap);

  for (let i = 0; i < segmentsPerLabelMap; i++) {
    colormap.setColor(i, newColormap[i]);
  }

  state.colorLutTables[colorMapId] = newColormap;
}
