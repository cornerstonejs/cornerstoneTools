import external from './../../externalModules.js';

import { getLogger } from '../../util/logger.js';

const logger = getLogger('store:modules:brushModule');

const state = {
  colorLutTable: [],
  drawColorId: 1,
  radius: 10,
  minRadius: 1,
  maxRadius: 50,
  alpha: 0.4,
  renderBrushIfHiddenButActive: true,
  colorMapId: 'BrushColorMap',
  visibleSegmentations: {}, // TODO - We aren't currently using this.
  segmentationMetadata: {},
};

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
  const colormap = external.cornerstone.colors.getColormap(state.colorMapId);

  colormap.setNumberOfColors(defaultSegmentationCount);

  // Values here are hand picked to jump around the color wheel in such a way
  // that you only get colors that are similar after every 15ish colors.

  let l = 0.5;
  let h = 0;

  let minL = 50;

  let decLumCount = 15;
  let inc = 97;

  colormap.setColor(0, [0, 0, 0, 0]);

  for (let i = 1; i <= defaultSegmentationCount; i++) {
    colormap.setColor(i, [...hslToRgb(h, 1, l), 255]);

    h += inc;
    if (h > 360) h -= 360;

    decLumCount--;

    if (decLumCount === 0) {
      decLumCount = 15;
      l = Math.min(l + 0.02, minL);
    }
  }

  const colorLutTable = [];

  for (let i = 0; i < defaultSegmentationCount; i++) {
    colorLutTable.push(colormap.getColor(i));
  }

  state.colorLutTable = colorLutTable;
}

function hslToRgb(h, s = 1.0, l = 0.58) {
  //logger.warn(`hslToRgb: hsl: ${h}, ${s}, ${l}`);

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let rp, gp, bp;

  if (h < 60) {
    [rp, gp, bp] = [c, x, 0];
  } else if (h < 120) {
    [rp, gp, bp] = [x, c, 0];
  } else if (h < 180) {
    [rp, gp, bp] = [0, c, x];
  } else if (h < 240) {
    [rp, gp, bp] = [0, x, c];
  } else if (h < 300) {
    [rp, gp, bp] = [x, 0, c];
  } else {
    [rp, gp, bp] = [c, 0, x];
  }

  return [(rp + m) * 255, (gp + m) * 255, (bp + m) * 255];
}
