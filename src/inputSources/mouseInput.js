import { cornerstoneMath, external } from '../externalModules.js';
import copyPoints from '../util/copyPoints.js';
import pauseEvent from '../util/pauseEvent.js';
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
  const eventType = 'CornerstoneToolsMouseDoubleClick';

  const startPoints = {
    page: cornerstoneMath.point.pageToPoint(e),
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
    which: getEventWhich(e),
    viewport: cornerstone.getViewport(element),
    image: cornerstone.getEnabledElement(element).image,
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

  triggerEvent(eventData.element, eventType, eventData);
}

function mouseDown (e) {
  preventClickTimeout = setTimeout(preventClickHandler, clickDelay);

  const cornerstone = external.cornerstone;
  const element = e.currentTarget;
  const eventType = 'CornerstoneToolsMouseDown';

  // Prevent CornerstoneToolsMouseMove while mouse is down
  external.$(element).off('mousemove', mouseMove);

  const startPoints = {
    page: cornerstoneMath.point.pageToPoint(e),
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
    image: cornerstone.getEnabledElement(element).image,
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
    eventData.type = 'CornerstoneToolsMouseDownActivate';
    triggerEvent(eventData.element, 'CornerstoneToolsMouseDownActivate', eventData);
  }

  const whichMouseButton = getEventWhich(e);

  function onMouseMove (e) {
    // Calculate our current points in page and image coordinates
    const eventType = 'CornerstoneToolsMouseDrag';
    const currentPoints = {
      page: cornerstoneMath.point.pageToPoint(e),
      image: cornerstone.pageToPixel(element, e.pageX, e.pageY),
      client: {
        x: e.clientX,
        y: e.clientY
      }
    };

    currentPoints.canvas = cornerstone.pixelToCanvas(element, currentPoints.image);

    // Calculate delta values in page and image coordinates
    const deltaPoints = {
      page: cornerstoneMath.point.subtract(currentPoints.page, lastPoints.page),
      image: cornerstoneMath.point.subtract(currentPoints.image, lastPoints.image),
      client: cornerstoneMath.point.subtract(currentPoints.client, lastPoints.client),
      canvas: cornerstoneMath.point.subtract(currentPoints.canvas, lastPoints.canvas)
    };

    const eventData = {
      which: whichMouseButton,
      viewport: cornerstone.getViewport(element),
      image: cornerstone.getEnabledElement(element).image,
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

    // Prevent left click selection of DOM elements
    return pauseEvent(e);
  }

  // Hook mouseup so we can unbind our event listeners
  // When they stop dragging
  function onMouseUp (e) {
    // Cancel the timeout preventing the click event from triggering
    clearTimeout(preventClickTimeout);

    let eventType = 'CornerstoneToolsMouseUp';

    if (isClickEvent) {
      eventType = 'CornerstoneToolsMouseClick';
    }

    // Calculate our current points in page and image coordinates
    const currentPoints = {
      page: cornerstoneMath.point.pageToPoint(e),
      image: cornerstone.pageToPixel(element, e.pageX, e.pageY),
      client: {
        x: e.clientX,
        y: e.clientY
      }
    };

    currentPoints.canvas = cornerstone.pixelToCanvas(element, currentPoints.image);

    // Calculate delta values in page and image coordinates
    const deltaPoints = {
      page: cornerstoneMath.point.subtract(currentPoints.page, lastPoints.page),
      image: cornerstoneMath.point.subtract(currentPoints.image, lastPoints.image),
      client: cornerstoneMath.point.subtract(currentPoints.client, lastPoints.client),
      canvas: cornerstoneMath.point.subtract(currentPoints.canvas, lastPoints.canvas)
    };

    const eventData = {
      event: e,
      which: whichMouseButton,
      viewport: cornerstone.getViewport(element),
      image: cornerstone.getEnabledElement(element).image,
      element,
      startPoints,
      lastPoints,
      currentPoints,
      deltaPoints,
      type: eventType
    };

    triggerEvent(eventData.element, eventType, eventData);

    external.$(document).off('mousemove', onMouseMove);
    external.$(document).off('mouseup', onMouseUp);

    external.$(eventData.element).on('mousemove', mouseMove);

    isClickEvent = true;
  }

  external.$(document).on('mousemove', onMouseMove);
  external.$(document).on('mouseup', onMouseUp);

  return pauseEvent(e);
}

function mouseMove (e) {
  const cornerstone = external.cornerstone;
  const element = e.currentTarget;
  const eventType = 'CornerstoneToolsMouseMove';

  const startPoints = {
    page: cornerstoneMath.point.pageToPoint(e),
    image: cornerstone.pageToPixel(element, e.pageX, e.pageY),
    client: {
      x: e.clientX,
      y: e.clientY
    }
  };

  startPoints.canvas = cornerstone.pixelToCanvas(element, startPoints.image);

  let lastPoints = copyPoints(startPoints);

  const whichMouseButton = getEventWhich(e);

  // Calculate our current points in page and image coordinates
  const currentPoints = {
    page: cornerstoneMath.point.pageToPoint(e),
    image: cornerstone.pageToPixel(element, e.pageX, e.pageY),
    client: {
      x: e.clientX,
      y: e.clientY
    }
  };

  currentPoints.canvas = cornerstone.pixelToCanvas(element, currentPoints.image);

  // Calculate delta values in page and image coordinates
  const deltaPoints = {
    page: cornerstoneMath.point.subtract(currentPoints.page, lastPoints.page),
    image: cornerstoneMath.point.subtract(currentPoints.image, lastPoints.image),
    client: cornerstoneMath.point.subtract(currentPoints.client, lastPoints.client),
    canvas: cornerstoneMath.point.subtract(currentPoints.canvas, lastPoints.canvas)
  };

  const eventData = {
    which: whichMouseButton,
    viewport: cornerstone.getViewport(element),
    image: cornerstone.getEnabledElement(element).image,
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
  external.$(element).off('mousedown', mouseDown);
  external.$(element).off('mousemove', mouseMove);
  external.$(element).off('dblclick', mouseDoubleClick);
}

function enable (element) {
  // Prevent handlers from being attached multiple times
  disable(element);

  external.$(element).on('mousedown', mouseDown);
  external.$(element).on('mousemove', mouseMove);
  external.$(element).on('dblclick', mouseDoubleClick);
}

// Module exports
const mouseInput = {
  enable,
  disable
};

export default mouseInput;
