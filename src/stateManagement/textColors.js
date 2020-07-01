let defaultColor = 'white',
  activeColor = 'greenyellow',
  fillColor = 'transparent';

function setFillColor(color) {
  fillColor = color;
}

function getFillColor() {
  return fillColor;
}

function setTextColor(color) {
  defaultColor = color;
}

function getTextColor() {
  return defaultColor;
}

function setActiveColor(color) {
  activeColor = color;
}

function getActiveColor() {
  return activeColor;
}

function getColorIfActive(data) {
  return data.active
    ? data.handles.textBox.activeColor || data.activeColor || activeColor
    : data.handles.textBox.color || data.color || defaultColor;
}

const textColors = {
  setFillColor,
  getFillColor,
  setTextColor,
  getTextColor,
  setActiveColor,
  getActiveColor,
  getColorIfActive,
};

export default textColors;
