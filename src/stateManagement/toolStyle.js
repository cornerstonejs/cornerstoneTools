let defaultWidth = 1,
  activeWidth = 2;

function setToolWidth(width) {
  defaultWidth = width;
}

function getToolWidth(data) {
  if (data && data.lineWidth) {
    return data.lineWidth;
  }
}

function setActiveWidth(width) {
  activeWidth = width;
}

function getActiveWidth() {
  return activeWidth;
}

const toolStyle = {
  setToolWidth,
  getToolWidth,
  setActiveWidth,
  getActiveWidth,
};

export default toolStyle;
