import EVENTS from '../events.js';
import external from '../externalModules.js';
import triggerEvent from '../util/triggerEvent.js';

/*
 * Define the runAnimation boolean as an object
 * so that it can be modified by reference
 */
const runAnimation = {
  value: false
};

const touchEndEvents = [
  EVENTS.TOUCH_END,
  EVENTS.TOUCH_DRAG_END,
  EVENTS.TOUCH_PINCH,
  EVENTS.TOUCH_PRESS,
  EVENTS.TAP
];

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
  external.cornerstone.updateImage(enabledElement.element);

  // Request a new frame
  external.cornerstone.requestAnimationFrame(function () {
    animate(time, handle, runAnimation, enabledElement, targetLocation);
  });
}

export default function (event, toolType, data, handle, doneMovingCallback) {
  // Console.log('touchMoveHandle');
  runAnimation.value = true;

  const touchEventData = event.detail;
  const element = touchEventData.element;
  const enabledElement = external.cornerstone.getEnabledElement(element);

  const time = (new Date()).getTime();

  // Average pixel width of index finger is 45-57 pixels
  // https://www.smashingmagazine.com/2012/02/finger-friendly-design-ideal-mobile-touchscreen-target-sizes/
  const fingerDistance = -57;

  const aboveFinger = {
    x: touchEventData.currentPoints.page.x,
    y: touchEventData.currentPoints.page.y + fingerDistance
  };

  let targetLocation = external.cornerstone.pageToPixel(element, aboveFinger.x, aboveFinger.y);

  function touchDragCallback (e) {
    const eventData = e.detail;

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

    targetLocation = external.cornerstone.pageToPixel(element, aboveFinger.x, aboveFinger.y);
    handle.x = targetLocation.x;
    handle.y = targetLocation.y;

    external.cornerstone.updateImage(element);

    const eventType = EVENTS.MEASUREMENT_MODIFIED;
    const modifiedEventData = {
      toolType,
      element,
      measurementData: data
    };

    triggerEvent(element, eventType, modifiedEventData);
  }

  element.addEventListener(EVENTS.TOUCH_DRAG, touchDragCallback);

  function touchEndCallback (e) {
    const eventData = e.detail;
    // Console.log('touchMoveHandle touchEndCallback: ' + e.type);

    runAnimation.value = false;

    handle.active = false;
    element.removeEventListener(EVENTS.TOUCH_DRAG, touchDragCallback);
    touchEndEvents.forEach((eventType) => {
      element.removeEventListener(eventType, touchEndCallback);
    });

    external.cornerstone.updateImage(element);

    if (e.type === EVENTS.TOUCH_PRESS) {
      eventData.handlePressed = data;

      handle.x = touchEventData.currentPoints.image.x;
      handle.y = touchEventData.currentPoints.image.y;
    }

    if (typeof doneMovingCallback === 'function') {
      doneMovingCallback(e);
    }
  }

  touchEndEvents.forEach((eventType) => {
    element.addEventListener(eventType, touchEndCallback);
  });

  animate(time, handle, runAnimation, enabledElement, targetLocation);
}
