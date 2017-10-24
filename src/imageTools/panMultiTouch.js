import { external } from '../externalModules.js';
import multiTouchDragTool from './multiTouchDragTool.js';

function touchPanCallback (e, eventData) {
  const config = panMultiTouch.getConfiguration();

  if (config && config.testPointers(eventData)) {
    eventData.viewport.translation.x += (eventData.deltaPoints.page.x / eventData.viewport.scale);
    eventData.viewport.translation.y += (eventData.deltaPoints.page.y / eventData.viewport.scale);
    external.cornerstone.setViewport(eventData.element, eventData.viewport);

    return false; // False = causes jquery to preventDefault() and stopPropagation() this event
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
