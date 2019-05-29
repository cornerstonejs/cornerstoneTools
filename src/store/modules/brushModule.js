import external from './../../externalModules.js';
import { getToolState } from '../../stateManagement/toolState.js';
import getNewBrushColorMap from '../../util/brush/getNewBrushColorMap.js';

//import BaseBrushTool from '../../tools/base/BaseBrushTool.js';

import { getLogger } from '../../util/logger.js';

const logger = getLogger('store:modules:brushModule');

const state = {
  colorLutTables: {},
  drawColorId: 1,
  radius: 10,
  minRadius: 1,
  maxRadius: 50,
  alpha: 0.4,
  renderBrushIfHiddenButActive: true, // TODO - We aren't currently using this.
  colorMapId: 'BrushColorMap',
  visibleSegmentations: {}, // TODO - We aren't currently using this.
  segmentationMetadata: {},
  series: {},

  // TODO -> active labelmap per series?
};

function getLabelMapsForElement(element) {
  const cornerstone = external.cornerstone;
  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];

  const enabledElement = cornerstone.getEnabledElement(element);

  const currentImageIdIndex = stackData.currentImageIdIndex;
  const { rows, columns } = enabledElement.image;
  const numberOfFrames = stackData.imageIds.length;
  const firstImageId = stackData.imageIds[0];

  let brushStackState = state.series[firstImageId];

  return {
    brushStackState,
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

  if (Array.isArray(brushStackState)) {
    if (!brushStackState[labelMapIndex]) {
      addLabelMap3D(
        brushStackState,
        labelMapIndex,
        rows * columns * numberOfFrames
      );
    }

    if (!brushStackState[labelMapIndex].labelMap2D[currentImageIdIndex]) {
      addLabelMap2DView(
        brushStackState,
        labelMapIndex,
        currentImageIdIndex,
        rows,
        columns
      );
    }
  } else {
    state.series[firstImageId] = [];

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
    labelMapSpecificBrushStackState: brushStackState[labelMapIndex],
    currentImageIdIndex,
  };
}

function addLabelMap3D(brushStackState, labelMapIndex, size) {
  brushStackState[labelMapIndex] = {
    buffer: new ArrayBuffer(size),
    labelMap2D: [],
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
  brushStackState[labelMapIndex].labelMap2D[currentImageIdIndex] = {
    pixelData: new Uint8Array(
      brushStackState[labelMapIndex].buffer,
      currentImageIdIndex * rows * columns,
      rows * columns
    ),
    invalidated: true,
  };
  // Clear cache for this displaySet to avoid flickering.
  brushStackState[labelMapIndex].imageBitmapCache = null;
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
  labelMapsForElement: getLabelMapsForElement,
};

const setters = {
  brushColorMap: setBrushColorMap,
  elementVisible: setElementVisible,
  brushVisibilityForElement: setBrushVisibilityForElement,
  imageBitmapCacheForElement: setImageBitmapCacheForElement,
  clearImageBitmapCacheForElement: clearImageBitmapCacheForElement,
  metadata: setMetadata,
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
  _initDefaultColorMap();
}

export default {
  state,
  onRegisterCallback,
  enabledElementCallback,
  getters,
  setters,
};

let colorPairIndex = 0;

function _initDefaultColorMap() {
  const defaultSegmentationCount = 255;
  const colorMapId = `${state.colorMapId}_0`;

  const colormap = external.cornerstone.colors.getColormap(colorMapId);

  colormap.setNumberOfColors(defaultSegmentationCount);

  const colorMap = getNewBrushColorMap(defaultSegmentationCount);

  for (let i = 0; i < defaultSegmentationCount; i++) {
    colormap.setColor(i, colorMap[i]);
  }

  state.colorLutTables[colorMapId] = colorMap;
}
