import external from '../../../externalModules';
import { getLogger } from '../../../util/logger';
import state from './state';
import configuration from './configuration';

const logger = getLogger('store:modules:segmentationModule:setColorLUT');

/**
 * SetColorLUT - Sets the labelmap to a specfic LUT, or generates a new LUT.
 *
 * @param  {number} labelmapIndex The labelmap index to apply the color LUT to.
 * @param  {number[][]} [colorLUT]    An array of The colorLUT to set.
 * @returns {null}
 */
export default function setColorLUT(labelmapIndex, colorLUT) {
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

  colorLUT = colorLUT || _generateNewColorLUT(segmentsPerLabelmap);

  // Apppend the "zero" (no label) color to the front of the LUT.
  colorLUT = [[0, 0, 0, 0], ...colorLUT];

  for (let i = 0; i <= segmentsPerLabelmap; i++) {
    colormap.setColor(i, colorLUT[i]);
  }

  state.colorLutTables[colorMapId] = colorLUT;
}

/**
 * Checks if the length of the colorLUT is sufficient.
 * @param  {number[][]} colorLUT
 * @param  {number} segmentsPerLabelmap
 * @returns {boolean} Whether the length is valid.
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
 * Generates a new color LUT (Look up table) of length `numberOfColors`,
 * which returns an RGBA color for each segment index.
 *
 * @param  {Number} numberOfColors = 255 The number of colors to generate
 * @returns {Number[][]}           The array of RGB values.
 */
function _generateNewColorLUT(numberOfColors = 255) {
  const rgbArr = [];

  for (let i = 0; i < numberOfColors; i++) {
    rgbArr.push(getRGBAfromHSLA(getNextHue(), getNextL()));
  }

  return rgbArr;
}

const goldenAngle = 137.5;
let hueValue = 222.5;

function getNextHue() {
  hueValue += goldenAngle;

  if (hueValue >= 360) {
    hueValue -= 360;
  }

  return hueValue;
}

let l = 0.6;
const maxL = 0.82;
const minL = 0.3;
const incL = 0.07;

function getNextL() {
  l += incL;

  if (l > maxL) {
    const diff = l - maxL;

    l = minL + diff;
  }

  return l;
}

/**
 * GetRGBAfromHSL - Returns an RGBA color given H, S, L and A.
 *
 * @param  {Number} hue         The hue.
 * @param  {Number} s = 1       The saturation.
 * @param  {Number} l = 0.6     The lightness.
 * @param  {Number} alpha = 255 The alpha.
 * @returns {Number[]}            The RGBA formatted color.
 */
function getRGBAfromHSLA(hue, s = 1, l = 0.6, alpha = 255) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;

  let r, g, b;

  if (hue < 60) {
    [r, g, b] = [c, x, 0];
  } else if (hue < 120) {
    [r, g, b] = [x, c, 0];
  } else if (hue < 180) {
    [r, g, b] = [0, c, x];
  } else if (hue < 240) {
    [r, g, b] = [0, x, c];
  } else if (hue < 300) {
    [r, g, b] = [x, 0, c];
  } else if (hue < 360) {
    [r, g, b] = [c, 0, x];
  }

  return [(r + m) * 255, (g + m) * 255, (b + m) * 255, alpha];
}
