import external from '../externalModules.js';
import multiTouchDragTool from './multiTouchDragTool.js';

function touchPanCallback (e) {
  const eventData = e.detail;
  const config = panMultiTouch.getConfiguration();

  if (config && config.testPointers(eventData)) {
    eventData.viewport.translation.x += (eventData.deltaPoints.page.x / eventData.viewport.scale);
    eventData.viewport.translation.y += (eventData.deltaPoints.page.y / eventData.viewport.scale);
    external.cornerstone.setViewport(eventData.element, eventData.viewport);

    e.preventDefault();
    e.stopPropagation();
  }
}

const configuration = {
  testPointers (eventData) {
    return (eventData.numPointers >= 2);
  }
};

const panMultiTouch = multiTouchDragTool(touchPanCallback);

panMultiTouch.setConfiguration(configuration);

export default panMultiTouch;
