import external from '../externalModules.js';
import doubleTapTool from './doubleTapTool.js';

function fitToWindowStrategy (eventData) {
  external.cornerstone.fitToWindow(eventData.element);
}

function doubleTapCallback (e) {
  const eventData = e.detail;

  doubleTapZoom.strategy(eventData);

  e.preventDefault();
  e.stopPropagation();
}

const doubleTapZoom = doubleTapTool(doubleTapCallback);

doubleTapZoom.strategies = {
  default: fitToWindowStrategy
};

doubleTapZoom.strategy = fitToWindowStrategy;

export default doubleTapZoom;
