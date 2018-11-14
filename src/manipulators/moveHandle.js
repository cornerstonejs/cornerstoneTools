import EVENTS from '../events.js';
import external from '../externalModules.js';
import triggerEvent from '../util/triggerEvent.js';
import { clipToBox } from '../util/clip.js';
import { state } from './../store/index.js';

const runAnimation = {
  value: false,
};

const _dragEvents = {
  mouse: [EVENTS.MOUSE_DRAG],
  touch: [EVENTS.TOUCH_DRAG],
};

const _upOrEndEvents = {
  mouse: [EVENTS.MOUSE_UP, EVENTS.MOUSE_CLICK],
  touch: [
    EVENTS.TOUCH_END,
    EVENTS.TOUCH_DRAG_END,
    EVENTS.TOUCH_PINCH,
    EVENTS.TOUCH_PRESS,
    EVENTS.TAP,
  ],
};

/**
 * Move the provided handle
 * @public
 * @method moveHandle
 * @memberof Manipulators
 *
 * @param {*} evtDetail
 * @param {*} toolName
 * @param {*} toolData
 * @param {*} handle
 * @param {*} [options={}]
 * @param {*} [options.preventHandleOutsideImage]
 * @param {*} [options.doneMovingCallback]
 * @param {*} [interactionType=mouse]
 * @returns {undefined}
 */
export default function(
  evtDetail,
  toolName,
  toolData,
  handle,
  options = {},
  interactionType = 'mouse'
) {
  const element = evtDetail.element;
  const dragHandler = _dragHandler.bind(
    this,
    toolName,
    toolData,
    handle,
    options,
    interactionType
  );
  // So we don't need to inline the entire `upOrEndHandler` function
  const upOrEndHandler = evt => {
    _upOrEndHandler(
      evtDetail,
      toolData,
      handle,
      options,
      interactionType,
      {
        dragHandler,
        upOrEndHandler,
      },
      evt
    );
  };

  handle.active = true;
  toolData.active = true;
  state.isToolLocked = true;

  // Add Event Listeners
  _dragEvents[interactionType].forEach(eventType => {
    element.addEventListener(eventType, dragHandler);
  });
  _upOrEndEvents[interactionType].forEach(eventType => {
    element.addEventListener(eventType, upOrEndHandler);
  });

  // ==========================
  // ========  TOUCH ==========
  // ==========================
  if (interactionType === 'touch') {
    runAnimation.value = true;
    const enabledElement = external.cornerstone.getEnabledElement(element);

    // Average pixel width of index finger is 45-57 pixels
    // https://www.smashingmagazine.com/2012/02/finger-friendly-design-ideal-mobile-touchscreen-target-sizes/
    const fingerDistance = -57;

    const aboveFinger = {
      x: evtDetail.currentPoints.page.x,
      y: evtDetail.currentPoints.page.y + fingerDistance,
    };

    const targetLocation = external.cornerstone.pageToPixel(
      element,
      aboveFinger.x,
      aboveFinger.y
    );

    _animate(handle, runAnimation, enabledElement, targetLocation);
  }
}

function _dragHandler(
  toolName,
  toolData,
  handle,
  options,
  interactionType,
  evt
) {
  const { image, currentPoints, element } = evt.detail;
  const page = currentPoints.page;
  const fingerOffset = -57;
  const targetLocation = external.cornerstone.pageToPixel(
    element,
    page.x,
    interactionType === 'touch' ? page.y + fingerOffset : page.y
  );

  if (handle.hasMoved === false) {
    handle.hasMoved = true;
  }

  runAnimation.value = false;
  handle.active = true;
  handle.x = targetLocation.x;
  handle.y = targetLocation.y;

  if (options.preventHandleOutsideImage) {
    clipToBox(handle, image);
  }

  external.cornerstone.updateImage(element);

  const eventType = EVENTS.MEASUREMENT_MODIFIED;
  const modifiedEventData = {
    toolName,
    element,
    measurementData: toolData,
  };

  triggerEvent(element, eventType, modifiedEventData);
}

function _upOrEndHandler(
  originalEventDetail,
  toolData,
  handle,
  options,
  interactionType,
  { dragHandler, upOrEndHandler },
  evt
) {
  const element = evt.detail.element;

  handle.active = false;
  toolData.active = false;
  state.isToolLocked = false;
  runAnimation.value = false;

  // Remove Event Listeners
  _dragEvents[interactionType].forEach(eventType => {
    element.removeEventListener(eventType, dragHandler);
  });
  _upOrEndEvents[interactionType].forEach(eventType => {
    element.removeEventListener(eventType, upOrEndHandler);
  });

  if (toolData.invalidated !== undefined) {
    toolData.invalidated = true;
  }

  external.cornerstone.updateImage(element);

  // TODO: What dark magic makes us want to handle TOUCH_PRESS differently?
  if (evt.type === EVENTS.TOUCH_PRESS) {
    evt.detail.handlePressed = toolData;
    handle.x = originalEventDetail.currentPoints.image.x; // Original Event
    handle.y = originalEventDetail.currentPoints.image.y;
  }

  if (typeof options.doneMovingCallback === 'function') {
    options.doneMovingCallback();
  }
}

/**
 * Animates the provided handle using `requestAnimationFrame`
 * @private
 * @method _animate
 *
 * @param {*} handle
 * @param {*} runAnimation
 * @param {*} enabledElement
 * @param {*} targetLocation
 * @returns {undefined}
 */
function _animate(handle, runAnimation, enabledElement, targetLocation) {
  if (!runAnimation.value) {
    return;
  }

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
  external.cornerstone.requestAnimationFrame(function() {
    _animate(handle, runAnimation, enabledElement, targetLocation);
  });
}
