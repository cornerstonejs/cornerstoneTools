import EVENTS from '../events.js';
import external from '../externalModules.js';
import triggerEvent from '../util/triggerEvent.js';

function mouseWheel (e) {
  const element = e.currentTarget;
  const enabledElement = external.cornerstone.getEnabledElement(element);

  if (!enabledElement.image) {
    return;
  }

  // !!!HACK/NOTE/WARNING!!!
  // For some reason I am getting mousewheel and DOMMouseScroll events on my
  // Mac os x mavericks system when middle mouse button dragging.
  // I couldn't find any info about this so this might break other systems
  // Webkit hack
  if (e.type === 'mousewheel' && e.wheelDeltaY === 0) {
    return;
  }
  // Firefox hack
  if (e.type === 'DOMMouseScroll' && e.axis === 1) {
    return;
  }

  e.preventDefault();

  let x;
  let y;

  if (e.pageX !== undefined && e.pageY !== undefined) {
    x = e.pageX;
    y = e.pageY;
  } else {
    // IE9 & IE10
    x = e.x;
    y = e.y;
  }

  const startingCoords = external.cornerstone.pageToPixel(element, x, y);

  e = window.event && window.event.wheelDelta ? window.event : e; // Old IE support

  let wheelDelta;

  if (e.wheelDelta) {
    wheelDelta = e.wheelDelta;
  } else if (e.deltaY) {
    wheelDelta = -e.deltaY;
  } else if (e.detail) {
    wheelDelta = -e.detail;
  } else {
    wheelDelta = e.wheelDelta;
  }

  const direction = wheelDelta < 0 ? -1 : 1;

  const mouseWheelData = {
    element,
    viewport: external.cornerstone.getViewport(element),
    detail: e,
    image: enabledElement.image,
    direction,
    pageX: x,
    pageY: y,
    imageX: startingCoords.x,
    imageY: startingCoords.y
  };

  triggerEvent(element, EVENTS.MOUSE_WHEEL, mouseWheelData);
}

const mouseWheelEvents = ['mousewheel', 'DOMMouseScroll'];

function enable (element) {
  // Prevent handlers from being attached multiple times
  disable(element);

  mouseWheelEvents.forEach((eventType) => {
    element.addEventListener(eventType, mouseWheel);
  });
}

function disable (element) {
  mouseWheelEvents.forEach((eventType) => {
    element.removeEventListener(eventType, mouseWheel);
  });
}

export default {
  enable,
  disable
};
