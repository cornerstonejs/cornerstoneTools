import * as cornerstone from 'cornerstone-core';
import * as cornerstoneMath from 'cornerstone-math';
import copyPoints from '../util/copyPoints.js';
import pauseEvent from '../util/pauseEvent.js';

let isClickEvent = true;
let preventClickTimeout;
const clickDelay = 200;

function preventClickHandler () {
  isClickEvent = false;
}

function activateMouseDown (mouseEventDetail) {
  $(mouseEventDetail.element).trigger('CornerstoneToolsMouseDownActivate', mouseEventDetail);
}

function mouseDoubleClick (e) {
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
    which: e.which,
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

  const event = $.Event(eventType, eventData);

  $(eventData.element).trigger(event, eventData);
}

function mouseDown (e) {
  preventClickTimeout = setTimeout(preventClickHandler, clickDelay);

  const element = e.currentTarget;
  const eventType = 'CornerstoneToolsMouseDown';

    // Prevent CornerstoneToolsMouseMove while mouse is down
  $(element).off('mousemove', mouseMove);

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
    which: e.which,
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

  const event = $.Event(eventType, eventData);

  $(eventData.element).trigger(event, eventData);

  if (event.isImmediatePropagationStopped() === false) {
        // No tools responded to this event, give the active tool a chance
    if (activateMouseDown(eventData) === true) {
      return pauseEvent(e);
    }
  }

  const whichMouseButton = e.which;

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
      type: eventType
    };

    $(eventData.element).trigger(eventType, eventData);

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

    const event = $.Event(eventType, eventData);

    $(eventData.element).trigger(event, eventData);

    $(document).off('mousemove', onMouseMove);
    $(document).off('mouseup', onMouseUp);

    $(eventData.element).on('mousemove', mouseMove);

    isClickEvent = true;
  }

  $(document).on('mousemove', onMouseMove);
  $(document).on('mouseup', onMouseUp);

  return pauseEvent(e);
}

function mouseMove (e) {
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

  const whichMouseButton = e.which;

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

  $(element).trigger(eventType, eventData);

    // Update the last points
  lastPoints = copyPoints(currentPoints);
}

function disable (element) {
  $(element).off('mousedown', mouseDown);
  $(element).off('mousemove', mouseMove);
  $(element).off('dblclick', mouseDoubleClick);
}

function enable (element) {
    // Prevent handlers from being attached multiple times
  disable(element);

  $(element).on('mousedown', mouseDown);
  $(element).on('mousemove', mouseMove);
  $(element).on('dblclick', mouseDoubleClick);
}

// Module exports
const mouseInput = {
  enable,
  disable
};

export default mouseInput;
