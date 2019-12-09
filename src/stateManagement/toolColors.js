let defaultColor = '#02ff00',
  activeColor = '#00ff00',
  fillColor = 'transparent',
  textColor = '#ffc300';

function setFillColor(color) {
  fillColor = color;
}

function getFillColor() {
  return fillColor;
}

function setToolColor(color) {
  defaultColor = color;
}

function getToolColor() {
  return defaultColor;
}

function setTextColor(color) {
  textColor = color;
}

function getTextColor() {
  return textColor;
}

function setActiveColor(color) {
  activeColor = color;
}

function getActiveColor() {
  return activeColor;
}

function getColorIfActive(data) {
  if (data.color) {
    return data.color;
  }

  return data.active ? activeColor : defaultColor;
}


const toolColors = {
  setFillColor,
  getFillColor,
  setToolColor,
  getToolColor,
  setActiveColor,
  getActiveColor,
  getColorIfActive,
  setTextColor,
  getTextColor,
};

export default toolColors;
