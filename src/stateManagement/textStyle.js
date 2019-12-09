let defaultFontSize = 15,
  defaultFont = `${defaultFontSize}px Arial`,
  defaultBackgroundColor = 'rgba(0, 0, 0, 0.8)';

function setFont(font) {
  defaultFont = font;
}

function getFont() {
  return defaultFont;
}

function setFontSize(fontSize) {
  defaultFontSize = fontSize;
}

function getFontSize() {
  return defaultFontSize;
}

function setBackgroundColor(backgroundColor) {
  defaultBackgroundColor = backgroundColor;
}

function getBackgroundColor() {
  return defaultBackgroundColor;
}

const textStyle = {
  setFont,
  getFont,
  setFontSize,
  getFontSize,
  setBackgroundColor,
  getBackgroundColor,
};

export default textStyle;
