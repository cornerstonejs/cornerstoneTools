import EVENTS from '../events.js';
import external from '../externalModules.js';
import copyPoints from '../util/copyPoints.js';
import triggerEvent from '../util/triggerEvent.js';
import { getLogger } from '../util/logger.js';

const logger = getLogger('eventListeners:mouseEventListeners');

let isClickEvent = true;
let preventClickTimeout;
const clickDelay = 200;

function getEventButtons(event) {
  if (typeof event.buttons === 'number') {
    return event.buttons;
  }

  switch (event.which) {
    // No button
    case 0:
      return 0;
    // Left
    case 1:
      return 1;
    // Middle
    case 2:
      return 4;
    // Right
    case 3:
      return 2;
  }

  return 0;
}

function preventClickHandler() {
  isClickEvent = false;
}

function mouseDoubleClick(e) {
  const element = e.currentTarget;
  const enabledElement = external.cornerstone.getEnabledElement(element);

  if (!enabledElement.image) {
    return;
  }

  const eventType = EVENTS.MOUSE_DOUBLE_CLICK;

  const startPoints = {
    page: external.cornerstoneMath.point.pageToPoint(e),
    image: external.cornerstone.pageToPixel(element, e.pageX, e.pageY),
    client: {
      x: e.clientX,
      y: e.clientY,
    },
  };

  startPoints.canvas = external.cornerstone.pixelToCanvas(
    element,
    startPoints.image
  );

  const lastPoints = copyPoints(startPoints);

  logger.log('double-click: %o', getEventButtons(e));
  const eventData = {
    event: e,
    buttons: getEventButtons(e),
    viewport: external.cornerstone.getViewport(element),
    image: enabledElement.image,
    element,
    startPoints,
    lastPoints,
    currentPoints: startPoints,
    deltaPoints: {
      x: 0,
      y: 0,
    },
    type: eventType,
  };

  triggerEvent(element, eventType, eventData);
}

function mouseDown(e) {
  const element = e.currentTarget;
  const enabledElement = external.cornerstone.getEnabledElement(element);

  if (!enabledElement.image) {
    return;
  }

  preventClickTimeout = setTimeout(preventClickHandler, clickDelay);

  // Prevent CornerstoneToolsMouseMove while mouse is down
  element.removeEventListener('mousemove', mouseMove);

  const startPoints = {
    page: external.cornerstoneMath.point.pageToPoint(e),
    image: external.cornerstone.pageToPixel(element, e.pageX, e.pageY),
    client: {
      x: e.clientX,
      y: e.clientY,
    },
  };

  startPoints.canvas = external.cornerstone.pixelToCanvas(
    element,
    startPoints.image
  );

  let lastPoints = copyPoints(startPoints);

  const eventData = {
    event: e,
    buttons: getEventButtons(e),
    viewport: external.cornerstone.getViewport(element),
    image: enabledElement.image,
    element,
    startPoints,
    lastPoints,
    currentPoints: startPoints,
    deltaPoints: {
      x: 0,
      y: 0,
    },
    type: EVENTS.MOUSE_DOWN,
  };

  const eventPropagated = triggerEvent(
    eventData.element,
    EVENTS.MOUSE_DOWN,
    eventData
  );

  if (eventPropagated) {
    // No tools responded to this event, create a new tool
    eventData.type = EVENTS.MOUSE_DOWN_ACTIVATE;
    triggerEvent(eventData.element, EVENTS.MOUSE_DOWN_ACTIVATE, eventData);
  }

  function onMouseMove(e) {
    // Calculate our current points in page and image coordinates
    const eventType = EVENTS.MOUSE_DRAG;
    const currentPoints = {
      page: external.cornerstoneMath.point.pageToPoint(e),
      image: external.cornerstone.pageToPixel(element, e.pageX, e.pageY),
      client: {
        x: e.clientX,
        y: e.clientY,
      },
    };

    currentPoints.canvas = external.cornerstone.pixelToCanvas(
      element,
      currentPoints.image
    );

    // Calculate delta values in page and image coordinates
    const deltaPoints = {
      page: external.cornerstoneMath.point.subtract(
        currentPoints.page,
        lastPoints.page
      ),
      image: external.cornerstoneMath.point.subtract(
        currentPoints.image,
        lastPoints.image
      ),
      client: external.cornerstoneMath.point.subtract(
        currentPoints.client,
        lastPoints.client
      ),
      canvas: external.cornerstoneMath.point.subtract(
        currentPoints.canvas,
        lastPoints.canvas
      ),
    };

    logger.log('mousemove: %o', getEventButtons(e));
    const eventData = {
      buttons: getEventButtons(e),
      viewport: external.cornerstone.getViewport(element),
      image: enabledElement.image,
      element,
      startPoints,
      lastPoints,
      currentPoints,
      deltaPoints,
      type: eventType,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      shiftKey: e.shiftKey,
    };

    triggerEvent(eventData.element, eventType, eventData);

    // Update the last points
    lastPoints = copyPoints(currentPoints);
  }

  // Hook mouseup so we can unbind our event listeners
  // When they stop dragging
  function onMouseUp(e) {
    // Cancel the timeout preventing the click event from triggering
    clearTimeout(preventClickTimeout);

    let eventType = EVENTS.MOUSE_UP;

    if (isClickEvent) {
      eventType = EVENTS.MOUSE_CLICK;
    }

    // Calculate our current points in page and image coordinates
    const currentPoints = {
      page: external.cornerstoneMath.point.pageToPoint(e),
      image: external.cornerstone.pageToPixel(element, e.pageX, e.pageY),
      client: {
        x: e.clientX,
        y: e.clientY,
      },
    };

    currentPoints.canvas = external.cornerstone.pixelToCanvas(
      element,
      currentPoints.image
    );

    // Calculate delta values in page and image coordinates
    const deltaPoints = {
      page: external.cornerstoneMath.point.subtract(
        currentPoints.page,
        lastPoints.page
      ),
      image: external.cornerstoneMath.point.subtract(
        currentPoints.image,
        lastPoints.image
      ),
      client: external.cornerstoneMath.point.subtract(
        currentPoints.client,
        lastPoints.client
      ),
      canvas: external.cornerstoneMath.point.subtract(
        currentPoints.canvas,
        lastPoints.canvas
      ),
    };

    logger.log('mouseup: %o', getEventButtons(e));
    const eventData = {
      event: e,
      buttons: getEventButtons(e),
      viewport: external.cornerstone.getViewport(element),
      image: enabledElement.image,
      element,
      startPoints,
      lastPoints,
      currentPoints,
      deltaPoints,
      type: eventType,
    };

    triggerEvent(eventData.element, eventType, eventData);

    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);

    element.addEventListener('mousemove', mouseMove);

    isClickEvent = true;
  }

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

function mouseMove(e) {
  const element = e.currentTarget;
  const enabledElement = external.cornerstone.getEnabledElement(element);

  if (!enabledElement.image) {
    return;
  }

  const eventType = EVENTS.MOUSE_MOVE;

  const startPoints = {
    page: external.cornerstoneMath.point.pageToPoint(e),
    image: external.cornerstone.pageToPixel(element, e.pageX, e.pageY),
    client: {
      x: e.clientX,
      y: e.clientY,
    },
  };

  startPoints.canvas = external.cornerstone.pixelToCanvas(
    element,
    startPoints.image
  );

  let lastPoints = copyPoints(startPoints);

  // Calculate our current points in page and image coordinates
  const currentPoints = {
    page: external.cornerstoneMath.point.pageToPoint(e),
    image: external.cornerstone.pageToPixel(element, e.pageX, e.pageY),
    client: {
      x: e.clientX,
      y: e.clientY,
    },
  };

  currentPoints.canvas = external.cornerstone.pixelToCanvas(
    element,
    currentPoints.image
  );

  // Calculate delta values in page and image coordinates
  const deltaPoints = {
    page: external.cornerstoneMath.point.subtract(
      currentPoints.page,
      lastPoints.page
    ),
    image: external.cornerstoneMath.point.subtract(
      currentPoints.image,
      lastPoints.image
    ),
    client: external.cornerstoneMath.point.subtract(
      currentPoints.client,
      lastPoints.client
    ),
    canvas: external.cornerstoneMath.point.subtract(
      currentPoints.canvas,
      lastPoints.canvas
    ),
  };

  const eventData = {
    viewport: external.cornerstone.getViewport(element),
    image: enabledElement.image,
    element,
    startPoints,
    lastPoints,
    currentPoints,
    deltaPoints,
    type: eventType,
  };

  triggerEvent(element, eventType, eventData);

  // Update the last points
  lastPoints = copyPoints(currentPoints);
}

function disable(element) {
  element.removeEventListener('mousedown', mouseDown);
  element.removeEventListener('mousemove', mouseMove);
  element.removeEventListener('dblclick', mouseDoubleClick);
}

function enable(element) {
  // Prevent handlers from being attached multiple times
  disable(element);

  element.addEventListener('mousedown', mouseDown);
  element.addEventListener('mousemove', mouseMove);
  element.addEventListener('dblclick', mouseDoubleClick);
}

export default {
  enable,
  disable,
};
