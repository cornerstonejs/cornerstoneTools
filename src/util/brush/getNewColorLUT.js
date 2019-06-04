/**
 * getNewColorLUT - Generates an array of RGB colors of length numberOfColors.
 *
 * @param  {Number} numberOfColors = 255 The number of colors to generate
 * @returns {Number[][]}           The array of RGB values.
 */
export default function getNewColorLUT(numberOfColors = 255) {
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
 * getRGBAfromHSL - Returns an RGBA color given H, S, L and A.
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
