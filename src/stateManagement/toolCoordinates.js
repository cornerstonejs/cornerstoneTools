let coordsData;

function setCoords(eventData) {
  coordsData = eventData.currentPoints.canvas;
}

function getCoords() {
  return coordsData;
}

const toolCoordinates = {
  setCoords,
  getCoords,
};

export default toolCoordinates;
