import EVENTS from '../events.js';
import external from '../externalModules.js';

function touchRotateCallback (e) {
  const eventData = e.detail;

  eventData.viewport.rotation += eventData.rotation;
  external.cornerstone.setViewport(eventData.element, eventData.viewport);

  return false;
}

function disable (element) {
  element.removeEventListener(EVENTS.TOUCH_ROTATE, touchRotateCallback);
}

function activate (element) {
  element.removeEventListener(EVENTS.TOUCH_ROTATE, touchRotateCallback);
  element.addEventListener(EVENTS.TOUCH_ROTATE, touchRotateCallback);
}

const rotateTouch = {
  activate,
  disable
};

export default rotateTouch;
