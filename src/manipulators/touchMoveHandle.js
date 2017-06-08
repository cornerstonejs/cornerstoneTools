import * as cornerstone from 'cornerstone-core';

 /*
 * Define the runAnimation boolean as an object
 * so that it can be modified by reference
 */
const runAnimation = {
  value: false
};

const touchEndEvents = ['CornerstoneToolsTouchEnd',
  'CornerstoneToolsDragEnd',
  'CornerstoneToolsTouchPinch',
  'CornerstoneToolsTouchPress',
  'CornerstoneToolsTap'
].join(' ');

function animate (lastTime, handle, runAnimation, enabledElement, targetLocation) {
    // See http://www.html5canvastutorials.com/advanced/html5-canvas-start-and-stop-an-animation/
  if (!runAnimation.value) {
    return;
  }

    // Update
  const time = (new Date()).getTime();
    // Var timeDiff = time - lastTime;

    // Pixels / second
  const distanceRemaining = Math.abs(handle.y - targetLocation.y);
  const linearDistEachFrame = distanceRemaining / 10;

  console.log(`distanceRemaining: ${distanceRemaining}`);
  if (distanceRemaining < 1) {
    handle.y = targetLocation.y;
    runAnimation.value = false;

    return;
  }

  if (handle.y > targetLocation.y) {
    handle.y -= linearDistEachFrame;
  } else if (handle.y < targetLocation.y) {
    handle.y += linearDistEachFrame;
  }

    // Update the image
  cornerstone.updateImage(enabledElement.element);

    // Request a new frame
  cornerstone.requestAnimationFrame(function () {
    animate(time, handle, runAnimation, enabledElement, targetLocation);
  });
}

export default function (touchEventData, toolType, data, handle, doneMovingCallback) {
    // Console.log('touchMoveHandle');
  runAnimation.value = true;

  const element = touchEventData.element;
  const enabledElement = cornerstone.getEnabledElement(element);

  const time = (new Date()).getTime();

    // Average pixel width of index finger is 45-57 pixels
    // https://www.smashingmagazine.com/2012/02/finger-friendly-design-ideal-mobile-touchscreen-target-sizes/
  const fingerDistance = -57;

  const aboveFinger = {
    x: touchEventData.currentPoints.page.x,
    y: touchEventData.currentPoints.page.y + fingerDistance
  };

  let targetLocation = cornerstone.pageToPixel(element, aboveFinger.x, aboveFinger.y);

  function touchDragCallback (e, eventData) {
        // Console.log('touchMoveHandle touchDragCallback: ' + e.type);
    runAnimation.value = false;

    if (handle.hasMoved === false) {
      handle.hasMoved = true;
    }

    handle.active = true;

    const currentPoints = eventData.currentPoints;
    const aboveFinger = {
      x: currentPoints.page.x,
      y: currentPoints.page.y + fingerDistance
    };

    targetLocation = cornerstone.pageToPixel(element, aboveFinger.x, aboveFinger.y);
    handle.x = targetLocation.x;
    handle.y = targetLocation.y;

    cornerstone.updateImage(element);

    const eventType = 'CornerstoneToolsMeasurementModified';
    const modifiedEventData = {
      toolType,
      element,
      measurementData: data
    };

    $(element).trigger(eventType, modifiedEventData);
  }

  $(element).on('CornerstoneToolsTouchDrag', touchDragCallback);

  function touchEndCallback (e, eventData) {
        // Console.log('touchMoveHandle touchEndCallback: ' + e.type);
    runAnimation.value = false;

    handle.active = false;
    $(element).off('CornerstoneToolsTouchDrag', touchDragCallback);
    $(element).off(touchEndEvents, touchEndCallback);

    cornerstone.updateImage(element);

    if (e.type === 'CornerstoneToolsTouchPress') {
      eventData.handlePressed = data;

      handle.x = touchEventData.currentPoints.image.x;
      handle.y = touchEventData.currentPoints.image.y;
    }

    if (typeof doneMovingCallback === 'function') {
      doneMovingCallback(e, eventData);
    }
  }

  $(element).on(touchEndEvents, touchEndCallback);

  animate(time, handle, runAnimation, enabledElement, targetLocation);
}
