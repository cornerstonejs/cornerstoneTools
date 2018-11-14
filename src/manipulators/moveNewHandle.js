import EVENTS from '../events.js';
import external from '../externalModules.js';
import triggerEvent from '../util/triggerEvent.js';
import { clipToBox } from '../util/clip.js';

const _moveEvents = {
  mouse: [EVENTS.MOUSE_MOVE, EVENTS.MOUSE_DRAG],
  touch: [EVENTS.TOUCH_DRAG],
};

const _moveEndEvents = {
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
 * Move a new handle
 * @public
 * @method moveNewHandle
 * @memberof Manipulators
 *
 * @param {*} eventDetail
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
  eventDetail,
  toolName,
  toolData,
  handle,
  options,
  interactionType = 'mouse'
) {
  console.log('moveNewHandle');
  const element = eventDetail.element;

  const toolDeactivatedHandler = _toolDeactivatedHandler.bind(
    this,
    toolName,
    moveEndHandler
  );
  const measurementRemovedHandler = _measurementRemovedHandler.bind(
    this,
    toolData,
    moveEndHandler
  );
  const moveHandler = _moveHandler.bind(
    this,
    toolName,
    toolData,
    handle,
    options
  );
  const moveEndHandler = _moveEndEHandler.bind(
    this,
    handle,
    options,
    interactionType,
    {
      moveHandler,
      moveEndHandler,
      measurementRemovedHandler,
      toolDeactivatedHandler,
    }
  );

  // Add event listeners
  _moveEvents[interactionType].forEach(eventType => {
    element.addEventListener(eventType, moveHandler);
  });
  _moveEndEvents[interactionType].forEach(eventType => {
    element.addEventListener(eventType, moveEndHandler);
  });
  element.addEventListener(
    EVENTS.MEASUREMENT_REMOVED,
    measurementRemovedHandler
  );
  element.addEventListener(EVENTS.TOOL_DEACTIVATED, toolDeactivatedHandler);
}

function _moveHandler(toolName, toolData, handle, options, evt) {
  const { currentPoints, image, element } = evt.detail;
  const { x, y } = currentPoints.image;

  handle.active = true;
  handle.x = x;
  handle.y = y;

  if (options && options.preventHandleOutsideImage) {
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

function _moveEndEHandler(
  handle,
  options,
  interactionType,
  {
    moveHandler,
    moveEndHandler,
    measurementRemovedHandler,
    toolDeactivatedHandler,
  },
  evt
) {
  console.log('moveNewHandle: moveEndHandler');
  const element = evt.detail.element;

  // Remove event listeners
  _moveEvents[interactionType].forEach(eventType => {
    element.removeEventListener(eventType, moveHandler);
  });
  _moveEndEvents[interactionType].forEach(eventType => {
    element.removeEventListener(eventType, moveEndHandler);
  });
  element.removeEventListener(
    EVENTS.MEASUREMENT_REMOVED,
    measurementRemovedHandler
  );
  element.removeEventListener(EVENTS.TOOL_DEACTIVATED, toolDeactivatedHandler);

  // "Release" the handle
  handle.active = false;
  if (typeof options.doneMovingCallback === 'function') {
    options.doneMovingCallback();
  }

  // Update Image
  external.cornerstone.updateImage(element);
}

/**
 * If our measurement was removed, we want to end "handling" it's data.
 *
 * @private
 * @function _measurementRemovedHandler
 *
 * @param {*} toolData
 * @param {*} moveEndHandler
 * @param {*} evt
 * @returns {undefined}
 */
function _measurementRemovedHandler(toolData, moveEndHandler, evt) {
  if (evt.detail.measurementData === toolData) {
    moveEndHandler(evt);
  }
}

/**
 * If the tool is deactivated while we're moving it's handle,
 * we'll want to stop moving it and kill events.
 *
 * @private
 * @function _toolDeactivatedHandler
 *
 * @param {string} toolName
 * @param {*} moveEndHandler
 * @param {*} evt
 * @returns {undefined}
 */
function _toolDeactivatedHandler(toolName, moveEndHandler, evt) {
  if (evt.detail.toolType === toolName) {
    moveEndHandler(evt);
  }
}
