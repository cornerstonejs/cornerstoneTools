const textStyle = {
  fontSize: 15,
  fontFamily: 'Arial',
  backgroundColor: 'transparent',
};

// Deprecate
function setFont(font) {
  const split = font.split('px ');

  if (split.length === 2) {
    setFontSize(split[0]);
    setFontFamily(split[1]);
  }
}

function getFont() {
  return `${textStyle.fontSize}px ${textStyle.fontFamily}`;
}

function setFontFamily(fontFamily) {
  textStyle.fontFamily = fontFamily;
}

function getFontFamily() {
  return textStyle.fontFamily;
}

function setFontSize(fontSize) {
  textStyle.fontSize = parseFloat(fontSize);
}

function getFontSize() {
  return textStyle.fontSize;
}

function setBackgroundColor(backgroundColor) {
  textStyle.backgroundColor = backgroundColor;
}

function getBackgroundColor() {
  return textStyle.backgroundColor;
}

const textStyleApi = {
  setFont,
  getFont,
  setFontSize,
  getFontSize,
  setFontFamily,
  getFontFamily,
  setBackgroundColor,
  getBackgroundColor,
};

export default textStyleApi;
