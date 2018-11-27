import EVENTS from '../events.js';
import external from '../externalModules.js';
import triggerEvent from '../util/triggerEvent.js';
import normalizeWheel from './internals/normalizeWheel.js';

/**
 *
 *
 * @param {WheelEvent} evt
 * @returns {undefined}
 */
function mouseWheel(evt) {
  const element = evt.currentTarget;
  const enabledElement = external.cornerstone.getEnabledElement(element);

  if (!enabledElement.image) {
    return;
  }

  evt.preventDefault();

  const { pageX, pageY } = evt;
  const startingCoords = external.cornerstone.pageToPixel(
    element,
    pageX,
    pageY
  );
  const { spinX, spinY, pixelX, pixelY } = normalizeWheel(evt);
  const direction = spinY < 0 ? -1 : 1;

  const mouseWheelData = {
    element,
    viewport: external.cornerstone.getViewport(element),
    detail: evt,
    image: enabledElement.image,
    direction,
    spinX,
    spinY,
    pixelX,
    pixelY,
    pageX,
    pageY,
    imageX: startingCoords.x,
    imageY: startingCoords.y,
  };

  triggerEvent(element, EVENTS.MOUSE_WHEEL, mouseWheelData);
}

function enable(element) {
  disable(element);
  element.addEventListener('wheel', mouseWheel, { passive: false });
}

function disable(element) {
  element.removeEventListener('wheel', mouseWheel, { passive: false });
}

export default {
  enable,
  disable,
};
