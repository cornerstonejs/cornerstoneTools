import EVENTS from '../events.js';
import external from '../externalModules.js';
import copyPoints from '../util/copyPoints.js';
import triggerEvent from '../util/triggerEvent.js';

let isClickEvent = true;
let preventClickTimeout;
const clickDelay = 200;

function getEventWhich (event) {
  if (typeof event.buttons !== 'number') {
    return event.which;
  }
  if (event.buttons === 0) {
    return 0;
  } else if (event.buttons % 2 === 1) {
    return 1;
  } else if (event.buttons % 4 === 2) {
    return 3;
  } else if (event.buttons % 8 === 4) {
    return 2;
  }

  return 0;
}

function preventClickHandler () {
  isClickEvent = false;
}

function mouseDoubleClick (e) {
  const cornerstone = external.cornerstone;
  const element = e.currentTarget;
  const enabledElement = cornerstone.getEnabledElement(element);

  if (!enabledElement.image) {
    return;
  }

  const eventType = EVENTS.MOUSE_DOUBLE_CLICK;

  const startPoints = {
    page: external.cornerstoneMath.point.pageToPoint(e),
    image: cornerstone.pageToPixel(element, e.pageX, e.pageY),
    client: {
      x: e.clientX,
      y: e.clientY
    }
  };

  startPoints.canvas = cornerstone.pixelToCanvas(element, startPoints.image);

  const lastPoints = copyPoints(startPoints);


  /* Note: It seems we can't trust MouseEvent.buttons for dblclick events?

    For some reason they are always firing with e.buttons = 0
    so we have to use e.which for now instead.

    Might be related to using preventDefault on the original mousedown or click events?
  */
  const eventData = {
    event: e,
    which: e.which,
    viewport: cornerstone.getViewport(element),
    image: enabledElement.image,
    element,
    startPoints,
    lastPoints,
    currentPoints: startPoints,
    deltaPoints: {
      x: 0,
      y: 0
    },
    type: eventType
  };

  triggerEvent(element, eventType, eventData);
}

function mouseDown (e) {
  const cornerstone = external.cornerstone;
  const element = e.currentTarget;
  const enabledElement = cornerstone.getEnabledElement(element);

  if (!enabledElement.image) {
    return;
  }

  preventClickTimeout = setTimeout(preventClickHandler, clickDelay);

  const eventType = EVENTS.MOUSE_DOWN;

  // Prevent CornerstoneToolsMouseMove while mouse is down
  element.removeEventListener('mousemove', mouseMove);

  const startPoints = {
    page: external.cornerstoneMath.point.pageToPoint(e),
    image: cornerstone.pageToPixel(element, e.pageX, e.pageY),
    client: {
      x: e.clientX,
      y: e.clientY
    }
  };

  startPoints.canvas = cornerstone.pixelToCanvas(element, startPoints.image);

  let lastPoints = copyPoints(startPoints);
  const eventData = {
    event: e,
    which: getEventWhich(e),
    viewport: cornerstone.getViewport(element),
    image: enabledElement.image,
    element,
    startPoints,
    lastPoints,
    currentPoints: startPoints,
    deltaPoints: {
      x: 0,
      y: 0
    },
    type: eventType
  };

  const eventPropagated = triggerEvent(eventData.element, eventType, eventData);

  if (eventPropagated) {
    // No tools responded to this event, create a new tool
    eventData.type = EVENTS.MOUSE_DOWN_ACTIVATE;
    triggerEvent(eventData.element, EVENTS.MOUSE_DOWN_ACTIVATE, eventData);
  }

  const whichMouseButton = getEventWhich(e);

  function onMouseMove (e) {
    // Calculate our current points in page and image coordinates
    const eventType = EVENTS.MOUSE_DRAG;
    const currentPoints = {
      page: external.cornerstoneMath.point.pageToPoint(e),
      image: cornerstone.pageToPixel(element, e.pageX, e.pageY),
      client: {
        x: e.clientX,
        y: e.clientY
      }
    };

    currentPoints.canvas = cornerstone.pixelToCanvas(element, currentPoints.image);

    // Calculate delta values in page and image coordinates
    const deltaPoints = {
      page: external.cornerstoneMath.point.subtract(currentPoints.page, lastPoints.page),
      image: external.cornerstoneMath.point.subtract(currentPoints.image, lastPoints.image),
      client: external.cornerstoneMath.point.subtract(currentPoints.client, lastPoints.client),
      canvas: external.cornerstoneMath.point.subtract(currentPoints.canvas, lastPoints.canvas)
    };

    const eventData = {
      which: whichMouseButton,
      viewport: cornerstone.getViewport(element),
      image: enabledElement.image,
      element,
      startPoints,
      lastPoints,
      currentPoints,
      deltaPoints,
      type: eventType,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      shiftKey: e.shiftKey
    };

    triggerEvent(eventData.element, eventType, eventData);

    // Update the last points
    lastPoints = copyPoints(currentPoints);
  }

  // Hook mouseup so we can unbind our event listeners
  // When they stop dragging
  function onMouseUp (e) {
    // Cancel the timeout preventing the click event from triggering
    clearTimeout(preventClickTimeout);

    let eventType = EVENTS.MOUSE_UP;

    if (isClickEvent) {
      eventType = EVENTS.MOUSE_CLICK;
    }

    // Calculate our current points in page and image coordinates
    const currentPoints = {
      page: external.cornerstoneMath.point.pageToPoint(e),
      image: cornerstone.pageToPixel(element, e.pageX, e.pageY),
      client: {
        x: e.clientX,
        y: e.clientY
      }
    };

    currentPoints.canvas = cornerstone.pixelToCanvas(element, currentPoints.image);

    // Calculate delta values in page and image coordinates
    const deltaPoints = {
      page: external.cornerstoneMath.point.subtract(currentPoints.page, lastPoints.page),
      image: external.cornerstoneMath.point.subtract(currentPoints.image, lastPoints.image),
      client: external.cornerstoneMath.point.subtract(currentPoints.client, lastPoints.client),
      canvas: external.cornerstoneMath.point.subtract(currentPoints.canvas, lastPoints.canvas)
    };

    const eventData = {
      event: e,
      which: whichMouseButton,
      viewport: cornerstone.getViewport(element),
      image: enabledElement.image,
      element,
      startPoints,
      lastPoints,
      currentPoints,
      deltaPoints,
      type: eventType
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

function mouseMove (e) {
  const cornerstone = external.cornerstone;
  const element = e.currentTarget;
  const enabledElement = cornerstone.getEnabledElement(element);

  if (!enabledElement.image) {
    return;
  }

  const eventType = EVENTS.MOUSE_MOVE;

  const startPoints = {
    page: external.cornerstoneMath.point.pageToPoint(e),
    image: cornerstone.pageToPixel(element, e.pageX, e.pageY),
    client: {
      x: e.clientX,
      y: e.clientY
    }
  };

  startPoints.canvas = cornerstone.pixelToCanvas(element, startPoints.image);

  let lastPoints = copyPoints(startPoints);

  // Calculate our current points in page and image coordinates
  const currentPoints = {
    page: external.cornerstoneMath.point.pageToPoint(e),
    image: cornerstone.pageToPixel(element, e.pageX, e.pageY),
    client: {
      x: e.clientX,
      y: e.clientY
    }
  };

  currentPoints.canvas = cornerstone.pixelToCanvas(element, currentPoints.image);

  // Calculate delta values in page and image coordinates
  const deltaPoints = {
    page: external.cornerstoneMath.point.subtract(currentPoints.page, lastPoints.page),
    image: external.cornerstoneMath.point.subtract(currentPoints.image, lastPoints.image),
    client: external.cornerstoneMath.point.subtract(currentPoints.client, lastPoints.client),
    canvas: external.cornerstoneMath.point.subtract(currentPoints.canvas, lastPoints.canvas)
  };

  const eventData = {
    viewport: cornerstone.getViewport(element),
    image: enabledElement.image,
    element,
    startPoints,
    lastPoints,
    currentPoints,
    deltaPoints,
    type: eventType
  };

  triggerEvent(element, eventType, eventData);

  // Update the last points
  lastPoints = copyPoints(currentPoints);
}

function disable (element) {
  element.removeEventListener('mousedown', mouseDown);
  element.removeEventListener('mousemove', mouseMove);
  element.removeEventListener('dblclick', mouseDoubleClick);
}

function mouseRightClick (e) {
  e.preventDefault();
  const cornerstone = external.cornerstone;
  const element = e.currentTarget;
  const enabledElement = cornerstone.getEnabledElement(element);

  if (!enabledElement.image) {
    return;
  }

  const eventType = EVENTS.MOUSE_RIGHT_CLICK;

  const startPoints = {
    page: external.cornerstoneMath.point.pageToPoint(e),
    image: cornerstone.pageToPixel(element, e.pageX, e.pageY),
    client: {
      x: e.clientX,
      y: e.clientY
    }
  };

  startPoints.canvas = cornerstone.pixelToCanvas(element, startPoints.image);

  const lastPoints = copyPoints(startPoints);
  const eventData = {
    event: e,
    which: e.which,
    viewport: cornerstone.getViewport(element),
    image: enabledElement.image,
    element,
    startPoints,
    lastPoints,
    currentPoints: startPoints,
    deltaPoints: {
      x: 0,
      y: 0
    },
    type: eventType
  };

  triggerEvent(element, eventType, eventData);
}


function enable (element) {
  // Prevent handlers from being attached multiple times
  disable(element);
  element.addEventListener('contextmenu', mouseRightClick);
  element.addEventListener('mousedown', mouseDown);
  element.addEventListener('mousemove', mouseMove);
  element.addEventListener('dblclick', mouseDoubleClick);
}

// Module exports
const mouseInput = {
  enable,
  disable
};

export default mouseInput;
