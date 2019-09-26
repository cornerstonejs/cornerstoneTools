import EVENTS from '../events.js';
import external from '../externalModules.js';
import anyHandlesOutsideImage from './anyHandlesOutsideImage.js';
import { removeToolState } from '../stateManagement/toolState.js';
import triggerEvent from '../util/triggerEvent.js';
import { clipToBox } from '../util/clip.js';
import { state } from './../store/index.js';
import getActiveTool from '../util/getActiveTool';
import BaseAnnotationTool from '../tools/base/BaseAnnotationTool';
import { getLogger } from '../util/logger.js';

const logger = getLogger('manipulators:moveNewHandle');

const _moveEvents = {
  mouse: [EVENTS.MOUSE_MOVE, EVENTS.MOUSE_DRAG],
  touch: [EVENTS.TOUCH_DRAG],
};

const _moveEndEvents = {
  mouse: [EVENTS.MOUSE_UP, EVENTS.MOUSE_CLICK],
  touch: [EVENTS.TOUCH_END, EVENTS.TOUCH_PINCH, EVENTS.TAP],
};

/**
 * Move a new handle
 * @public
 * @method moveNewHandle
 * @memberof Manipulators
 *
 * @param {*} evtDetail
 * @param {*} toolName
 * @param {*} annotation
 * @param {*} handle
 * @param {*} [options={}]
 * @param {Boolean}  [options.deleteIfHandleOutsideImage]
 * @param {Boolean}  [options.preventHandleOutsideImage]
 * @param {string} [interactionType=mouse]
 * @param {function} [doneMovingCallback]
 * @returns {void}
 */
export default function(
  evtDetail,
  toolName,
  annotation,
  handle,
  options,
  interactionType = 'mouse',
  doneMovingCallback
) {
  // Use global defaults, unless overidden by provided options
  options = Object.assign(
    {
      deleteIfHandleOutsideImage: state.deleteIfHandleOutsideImage,
      preventHandleOutsideImage: state.preventHandleOutsideImage,
    },
    options
  );

  const element = evtDetail.element;

  annotation.active = true;
  handle.active = true;
  state.isToolLocked = true;

  function moveHandler(evt) {
    _moveHandler(
      toolName,
      annotation,
      handle,
      options,
      interactionType,
      {
        moveHandler,
        moveEndHandler,
      },
      evt
    );
  }
  // So we don't need to inline the entire `moveEndEventHandler` function
  function moveEndHandler(evt) {
    _moveEndHandler(
      toolName,
      annotation,
      handle,
      options,
      interactionType,
      {
        moveHandler,
        moveEndHandler,
      },
      evt,
      doneMovingCallback
    );
  }

  // Add event listeners
  _moveEvents[interactionType].forEach(eventType => {
    element.addEventListener(eventType, moveHandler);
  });
  element.addEventListener(EVENTS.TOUCH_START, _stopImmediatePropagation);
}

function _moveHandler(
  toolName,
  annotation,
  handle,
  options,
  interactionType,
  { moveEndHandler },
  evt
) {
  const { currentPoints, image, element, buttons } = evt.detail;
  // Add moveEndEvent Handler when move trigger

  _moveEndEvents[interactionType].forEach(eventType => {
    element.addEventListener(eventType, moveEndHandler);
  });
  const page = currentPoints.page;
  const fingerOffset = 0;
  const targetLocation = external.cornerstone.pageToPixel(
    element,
    interactionType === 'touch' ? page.x + fingerOffset : page.x,
    interactionType === 'touch' ? page.y + fingerOffset : page.y
  );

  annotation.invalidated = true;
  handle.active = true;
  handle.x = targetLocation.x;
  handle.y = targetLocation.y;

  if (options && options.preventHandleOutsideImage) {
    clipToBox(handle, image);
  }

  external.cornerstone.updateImage(element);

  const activeTool = getActiveTool(element, buttons, interactionType);

  if (activeTool instanceof BaseAnnotationTool) {
    activeTool.updateCachedStats(image, element, annotation);
  }

  const eventType = EVENTS.MEASUREMENT_MODIFIED;
  const modifiedEventData = {
    toolName,
    element,
    measurementData: annotation,
  };

  triggerEvent(element, eventType, modifiedEventData);
}

function _moveEndHandler(
  toolName,
  annotation,
  handle,
  options,
  interactionType,
  { moveHandler, moveEndHandler },
  evt,
  doneMovingCallback
) {
  const { element, currentPoints } = evt.detail;
  const page = currentPoints.page;
  const fingerOffset = 0;
  const targetLocation = external.cornerstone.pageToPixel(
    element,
    interactionType === 'touch' ? page.x + fingerOffset : page.x,
    interactionType === 'touch' ? page.y + fingerOffset : page.y
  );

  // "Release" the handle
  annotation.active = false;
  annotation.invalidated = true;
  handle.active = false;
  handle.x = targetLocation.x;
  handle.y = targetLocation.y;
  state.isToolLocked = false;

  // Remove event listeners
  _moveEvents[interactionType].forEach(eventType => {
    element.removeEventListener(eventType, moveHandler);
  });
  _moveEndEvents[interactionType].forEach(eventType => {
    element.removeEventListener(eventType, moveEndHandler);
  });
  element.removeEventListener(EVENTS.TOUCH_START, _stopImmediatePropagation);

  // TODO: WHY?
  // Why would a Touch_Pinch or Touch_Press be associated with a new handle?
  if (evt.type === EVENTS.TOUCH_PINCH || evt.type === EVENTS.TOUCH_PRESS) {
    handle.active = false;
    external.cornerstone.updateImage(element);
    if (typeof options.doneMovingCallback === 'function') {
      logger.warn(
        '`options.doneMovingCallback` has been depricated. See https://github.com/cornerstonejs/cornerstoneTools/pull/915 for details.'
      );

      options.doneMovingCallback();
    }

    if (typeof doneMovingCallback === 'function') {
      doneMovingCallback();
    }

    return;
  }

  if (options.preventHandleOutsideImage) {
    clipToBox(handle, evt.detail.image);
  }

  // If any handle is outside the image, delete the tool data
  if (
    options.deleteIfHandleOutsideImage &&
    anyHandlesOutsideImage(evt.detail, annotation.handles)
  ) {
    removeToolState(element, toolName, annotation);
  }

  if (typeof options.doneMovingCallback === 'function') {
    logger.warn(
      '`options.doneMovingCallback` has been depricated. See https://github.com/cornerstonejs/cornerstoneTools/pull/915 for details.'
    );

    options.doneMovingCallback();
  }

  if (typeof doneMovingCallback === 'function') {
    doneMovingCallback();
  }

  // Update Image
  external.cornerstone.updateImage(element);
}

/**
 * Stop the CornerstoneToolsTouchStart event from
 * Becoming a CornerstoneToolsTouchStartActive event when
 * MoveNewHandle ends
 *
 * @private
 * @function _stopImmediatePropagation
 *
 * @param {*} evt
 * @returns {Boolean} false
 */
function _stopImmediatePropagation(evt) {
  evt.stopImmediatePropagation();

  return false;
}
