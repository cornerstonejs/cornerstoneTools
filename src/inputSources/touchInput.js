import Hammer from 'hammerjs';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneMath from 'cornerstone-math';
import copyPoints from '../util/copyPoints';
import pauseEvent from '../util/pauseEvent';
import preventGhostClick from '../inputSources/preventGhostClick';

let startPoints,
  currentPoints,
  lastPoints,
  deltaPoints,
  eventData,
  touchStartDelay,
  pressTimeout,
  pageDistanceMoved;

let lastScale = 1.0,
  lastRotation = 0.0,
  preventNextPinch = false,
  isPress = false,
  lastDelta;

const pressDelay = 700,
  pressMaxDistance = 5;

function onTouch (e) {
  const element = e.currentTarget || e.srcEvent.currentTarget;
  let event,
    eventType,
    scaleChange,
    delta,
    remainingPointers,
    rotation;

    // Prevent mouse events from occurring alongside touch events
  e.preventDefault();

    // If more than one finger is placed on the element, stop the press timeout
  if ((e.pointers && e.pointers.length > 1) ||
        (e.originalEvent && e.originalEvent.touches && e.originalEvent.touches.length > 1)) {
    isPress = false;
    clearTimeout(pressTimeout);
  }

  switch (e.type) {
  case 'tap':
    isPress = false;
    clearTimeout(pressTimeout);

            // Calculate our current points in page and image coordinates
    currentPoints = {
      page: cornerstoneMath.point.pageToPoint(e.pointers[0]),
      image: cornerstone.pageToPixel(element, e.pointers[0].pageX, e.pointers[0].pageY),
      client: {
        x: e.pointers[0].clientX,
        y: e.pointers[0].clientY
      }
    };
    currentPoints.canvas = cornerstone.pixelToCanvas(element, currentPoints.image);

    eventType = 'CornerstoneToolsTap';
    eventData = {
      event: e,
      viewport: cornerstone.getViewport(element),
      image: cornerstone.getEnabledElement(element).image,
      element,
      currentPoints,
      type: eventType,
      isTouchEvent: true
    };

    event = $.Event(eventType, eventData);
    $(element).trigger(event, eventData);
    break;

  case 'doubletap':
    isPress = false;
    clearTimeout(pressTimeout);

            // Calculate our current points in page and image coordinates
    currentPoints = {
      page: cornerstoneMath.point.pageToPoint(e.pointers[0]),
      image: cornerstone.pageToPixel(element, e.pointers[0].pageX, e.pointers[0].pageY),
      client: {
        x: e.pointers[0].clientX,
        y: e.pointers[0].clientY
      }
    };
    currentPoints.canvas = cornerstone.pixelToCanvas(element, currentPoints.image);

    eventType = 'CornerstoneToolsDoubleTap';
    eventData = {
      event: e,
      viewport: cornerstone.getViewport(element),
      image: cornerstone.getEnabledElement(element).image,
      element,
      currentPoints,
      type: eventType,
      isTouchEvent: true
    };

    event = $.Event(eventType, eventData);
    $(element).trigger(event, eventData);
    break;

  case 'pinchstart':
    isPress = false;
    clearTimeout(pressTimeout);

    lastScale = 1.0;
    break;

  case 'pinchmove':
    isPress = false;
    clearTimeout(pressTimeout);

    if (preventNextPinch === true) {
      lastScale = e.scale;
      preventNextPinch = false;
      break;
    }

    scaleChange = (e.scale - lastScale) / lastScale;

    startPoints = {
      page: e.center,
      image: cornerstone.pageToPixel(element, e.center.x, e.center.y)
    };
    startPoints.canvas = cornerstone.pixelToCanvas(element, startPoints.image);

    eventType = 'CornerstoneToolsTouchPinch';
    eventData = {
      event: e,
      startPoints,
      viewport: cornerstone.getViewport(element),
      image: cornerstone.getEnabledElement(element).image,
      element,
      direction: e.scale < 1 ? 1 : -1,
      scaleChange,
      type: eventType,
      isTouchEvent: true
    };

    event = $.Event(eventType, eventData);
    $(element).trigger(event, eventData);

    lastScale = e.scale;
    break;

  case 'touchstart':
    lastScale = 1.0;

    clearTimeout(pressTimeout);

    clearTimeout(touchStartDelay);
    touchStartDelay = setTimeout(function () {
      startPoints = {
        page: cornerstoneMath.point.pageToPoint(e.originalEvent.touches[0]),
        image: cornerstone.pageToPixel(element, e.originalEvent.touches[0].pageX, e.originalEvent.touches[0].pageY),
        client: {
          x: e.originalEvent.touches[0].clientX,
          y: e.originalEvent.touches[0].clientY
        }
      };
      startPoints.canvas = cornerstone.pixelToCanvas(element, startPoints.image);

      eventType = 'CornerstoneToolsTouchStart';
      if (e.originalEvent.touches.length > 1) {
        eventType = 'CornerstoneToolsMultiTouchStart';
      }

      eventData = {
        event: e,
        viewport: cornerstone.getViewport(element),
        image: cornerstone.getEnabledElement(element).image,
        element,
        startPoints,
        currentPoints: startPoints,
        type: eventType,
        isTouchEvent: true
      };

      event = $.Event(eventType, eventData);
      $(element).trigger(event, eventData);

      if (event.isImmediatePropagationStopped() === false) {
                    // IsPress = false;
                    // ClearTimeout(pressTimeout);

                    // No current tools responded to the drag action.
                    // Create new tool measurement
        eventType = 'CornerstoneToolsTouchStartActive';
        if (e.originalEvent.touches.length > 1) {
          eventType = 'CornerstoneToolsMultiTouchStartActive';
        }

        eventData.type = eventType;
        $(element).trigger(eventType, eventData);
      }

                // Console.log(eventType);
      lastPoints = copyPoints(startPoints);
    }, 50);

    isPress = true;
    pageDistanceMoved = 0;
    pressTimeout = setTimeout(function () {
      if (!isPress) {
        return;
      }

      currentPoints = {
        page: cornerstoneMath.point.pageToPoint(e.originalEvent.touches[0]),
        image: cornerstone.pageToPixel(element, e.originalEvent.touches[0].pageX, e.originalEvent.touches[0].pageY),
        client: {
          x: e.originalEvent.touches[0].clientX,
          y: e.originalEvent.touches[0].clientY
        }
      };
      currentPoints.canvas = cornerstone.pixelToCanvas(element, startPoints.image);

      eventType = 'CornerstoneToolsTouchPress';
      eventData = {
        event: e,
        viewport: cornerstone.getViewport(element),
        image: cornerstone.getEnabledElement(element).image,
        element,
        currentPoints,
        type: eventType,
        isTouchEvent: true
      };

      event = $.Event(eventType, eventData);
      $(element).trigger(event, eventData);

                // Console.log(eventType);
    }, pressDelay);
    break;

  case 'touchend':
    lastScale = 1.0;

    isPress = false;
    clearTimeout(pressTimeout);

    setTimeout(function () {
      startPoints = {
        page: cornerstoneMath.point.pageToPoint(e.originalEvent.changedTouches[0]),
        image: cornerstone.pageToPixel(element, e.originalEvent.changedTouches[0].pageX, e.originalEvent.changedTouches[0].pageY),
        client: {
          x: e.originalEvent.changedTouches[0].clientX,
          y: e.originalEvent.changedTouches[0].clientY
        }
      };
      startPoints.canvas = cornerstone.pixelToCanvas(element, startPoints.image);

      eventType = 'CornerstoneToolsTouchEnd';

      eventData = {
        event: e,
        viewport: cornerstone.getViewport(element),
        image: cornerstone.getEnabledElement(element).image,
        element,
        startPoints,
        currentPoints: startPoints,
        type: eventType,
        isTouchEvent: true
      };

      event = $.Event(eventType, eventData);
      $(element).trigger(event, eventData);
    }, 50);
    break;

  case 'panmove':
            // Using the delta-value of HammerJS, because it takes all pointers into account
            // This is very important when using panning in combination with pinch-zooming
            // But HammerJS' delta is relative to the start of the pan event
            // So it needs to be converted to a per-event-delta for CornerstoneTools
    delta = {
      x: e.deltaX - lastDelta.x,
      y: e.deltaY - lastDelta.y
    };

    lastDelta = {
      x: e.deltaX,
      y: e.deltaY
    };

            // Calculate our current points in page and image coordinates
    currentPoints = {
      page: {
        x: lastPoints.page.x + delta.x,
        y: lastPoints.page.y + delta.y
      },
      image: cornerstone.pageToPixel(element, lastPoints.page.x + delta.x, lastPoints.page.y + delta.y),
      client: {
        x: lastPoints.client.x + delta.x,
        y: lastPoints.client.y + delta.y
      }
    };
    currentPoints.canvas = cornerstone.pixelToCanvas(element, currentPoints.image);

            // Calculate delta values in page and image coordinates
    deltaPoints = {
      page: cornerstoneMath.point.subtract(currentPoints.page, lastPoints.page),
      image: cornerstoneMath.point.subtract(currentPoints.image, lastPoints.image),
      client: cornerstoneMath.point.subtract(currentPoints.client, lastPoints.client),
      canvas: cornerstoneMath.point.subtract(currentPoints.canvas, lastPoints.canvas)
    };

    pageDistanceMoved += Math.sqrt(deltaPoints.page.x * deltaPoints.page.x + deltaPoints.page.y * deltaPoints.page.y);
            // Console.log("pageDistanceMoved: " + pageDistanceMoved);
    if (pageDistanceMoved > pressMaxDistance) {
                // Console.log('Press event aborted due to movement');
      isPress = false;
      clearTimeout(pressTimeout);
    }

    eventType = 'CornerstoneToolsTouchDrag';
    if (e.pointers.length > 1) {
      eventType = 'CornerstoneToolsMultiTouchDrag';
    }

    eventData = {
      viewport: cornerstone.getViewport(element),
      image: cornerstone.getEnabledElement(element).image,
      element,
      startPoints,
      lastPoints,
      currentPoints,
      deltaPoints,
      numPointers: e.pointers.length,
      type: eventType,
      isTouchEvent: true
    };

    event = $.Event(eventType, eventData);
    $(element).trigger(event, eventData);

    lastPoints = copyPoints(currentPoints);
    break;

  case 'panstart':
    lastDelta = {
      x: e.deltaX,
      y: e.deltaY
    };

    currentPoints = {
      page: cornerstoneMath.point.pageToPoint(e.pointers[0]),
      image: cornerstone.pageToPixel(element, e.pointers[0].pageX, e.pointers[0].pageY),
      client: {
        x: e.pointers[0].clientX,
        y: e.pointers[0].clientY
      }
    };
    currentPoints.canvas = cornerstone.pixelToCanvas(element, currentPoints.image);
    lastPoints = copyPoints(currentPoints);
    break;

  case 'panend':
    isPress = false;
    clearTimeout(pressTimeout);

            // If lastPoints is not yet set, it means panend fired without panstart or pan,
            // So we can ignore this event
    if (!lastPoints) {
      return false;
    }

    currentPoints = {
      page: cornerstoneMath.point.pageToPoint(e.pointers[0]),
      image: cornerstone.pageToPixel(element, e.pointers[0].pageX, e.pointers[0].pageY),
      client: {
        x: e.pointers[0].clientX,
        y: e.pointers[0].clientY
      }
    };
    currentPoints.canvas = cornerstone.pixelToCanvas(element, currentPoints.image);

            // Calculate delta values in page and image coordinates
    deltaPoints = {
      page: cornerstoneMath.point.subtract(currentPoints.page, lastPoints.page),
      image: cornerstoneMath.point.subtract(currentPoints.image, lastPoints.image),
      client: cornerstoneMath.point.subtract(currentPoints.client, lastPoints.client),
      canvas: cornerstoneMath.point.subtract(currentPoints.canvas, lastPoints.canvas)
    };

    eventType = 'CornerstoneToolsDragEnd';

    eventData = {
      event: e.srcEvent,
      viewport: cornerstone.getViewport(element),
      image: cornerstone.getEnabledElement(element).image,
      element,
      startPoints,
      lastPoints,
      currentPoints,
      deltaPoints,
      type: eventType,
      isTouchEvent: true
    };

    event = $.Event(eventType, eventData);
    $(element).trigger(event, eventData);

    remainingPointers = e.pointers.length - e.changedPointers.length;

    if (remainingPointers === 2) {
      preventNextPinch = true;
    }

    return pauseEvent(e);

  case 'rotatemove':
    isPress = false;
    clearTimeout(pressTimeout);

    rotation = e.rotation - lastRotation;

    lastRotation = e.rotation;

    eventType = 'CornerstoneToolsTouchRotate';
    eventData = {
      event: e.srcEvent,
      viewport: cornerstone.getViewport(element),
      image: cornerstone.getEnabledElement(element).image,
      element,
      rotation,
      type: eventType
    };
    event = $.Event(eventType, eventData);
    $(element).trigger(event, eventData);
    break;
  }

    // Console.log(eventType);
  return false;
}

function enable (element) {
  disable(element);

  const hammerOptions = {
    inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput
  };

  const mc = new Hammer.Manager(element, hammerOptions);

  const panOptions = {
    pointers: 0,
    direction: Hammer.DIRECTION_ALL,
    threshold: 0
  };

  const pan = new Hammer.Pan(panOptions);
  const pinch = new Hammer.Pinch({
    threshold: 0
  });
  const rotate = new Hammer.Rotate({
    threshold: 0
  });

    // We want to detect both the same time
  pinch.recognizeWith(pan);
  pinch.recognizeWith(rotate);
  rotate.recognizeWith(pan);

  const doubleTap = new Hammer.Tap({
    event: 'doubletap',
    taps: 2,
    interval: 1500,
    threshold: 50,
    posThreshold: 50
  });

  doubleTap.recognizeWith(pan);

    // Add to the Manager
  mc.add([doubleTap, pan, rotate, pinch]);
  mc.on('tap doubletap panstart panmove panend pinchstart pinchmove rotatemove', onTouch);

  preventGhostClick.enable(element);
  $(element).on('touchstart touchend', onTouch);
  $(element).data('hammer', mc);
    // Console.log('touchInput enabled');
}

function disable (element) {
  preventGhostClick.disable(element);
  $(element).off('touchstart touchend', onTouch);
  const mc = $(element).data('hammer');

  if (mc) {
    mc.off('tap doubletap panstart panmove panend pinchmove rotatemove', onTouch);
  }

    // Console.log('touchInput disabled');
}

// Module exports
const touchInput = {
  enable,
  disable
};

export default touchInput;
