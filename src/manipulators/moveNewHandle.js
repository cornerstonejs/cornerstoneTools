import EVENTS from '../events.js';
import external from '../externalModules.js';
import anyHandlesOutsideImage from './anyHandlesOutsideImage.js';
import { removeToolState } from '../stateManagement/toolState.js';
import triggerEvent from '../util/triggerEvent.js';
import { clipToBox } from '../util/clip.js';
import { state, setters } from './../store/index.js';
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
 *
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
      evt,
      doneMovingCallback
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

  // Start tracking in-flight listeners
  //
}

/**
 * Updates annotation as the "pointer" is moved/dragged
 * Emits `cornerstonetoolsmeasurementmodified` events
 */
function _moveHandler(
  toolName,
  annotation,
  handle,
  options,
  interactionType,
  { moveHandler, moveEndHandler },
  evt,
  doneMovingCallback
) {
  const { currentPoints, image, element, buttons } = evt.detail;

  // Handle "END"
  _moveEndEvents[interactionType].forEach(eventType => {
    element.addEventListener(eventType, moveEndHandler);
  });

  // Or... Handle "CANCEL"
  setters.addInFlightManipulatorThing(
    annotation.uuid,
    _cancelEventHandlers.bind(
      null,
      annotation,
      handle,
      interactionType,
      {
        moveHandler,
        moveEndHandler,
      },
      element,
      doneMovingCallback
    )
  );

  const page = currentPoints.page;
  const fingerOffset = -57;
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

/**
 * "Unlocks" tool dispatchets and deregisters event listeners when "pointer" is released
 * Potentially some validation of annotation
 */
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
  const fingerOffset = -57;
  const targetLocation = external.cornerstone.pageToPixel(
    element,
    interactionType === 'touch' ? page.x + fingerOffset : page.x,
    interactionType === 'touch' ? page.y + fingerOffset : page.y
  );

  // Update handle location
  handle.x = targetLocation.x;
  handle.y = targetLocation.y;

  // TODO: Think of a better name; this also triggers event cancelation
  setters.removeInFlightManipulatorThing(annotation.uuid);

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

  if (typeof doneMovingCallback === 'function') {
    doneMovingCallback();
  }

  // Update Image
  external.cornerstone.updateImage(element);
}

// AnnotationId?
// element, eventType, function

// TODO: Because this is `moveNewHandle`, can we safely delete annotation here, unlike in other
// TODO: Handlers where it may be conditional?
function _cancelEventHandlers(
  annotation,
  handle,
  // Options,
  interactionType,
  { moveHandler, moveEndHandler },
  element,
  doneMovingCallback
) {
  // "Release" the handle
  annotation.active = false;
  annotation.invalidated = true;
  handle.active = false;
  state.isToolLocked = false;

  // Remove event listeners
  _moveEvents[interactionType].forEach(eventType => {
    element.removeEventListener(eventType, moveHandler);
  });
  _moveEndEvents[interactionType].forEach(eventType => {
    element.removeEventListener(eventType, moveEndHandler);
  });
  element.removeEventListener(EVENTS.TOUCH_START, _stopImmediatePropagation);

  // TODO: How should we handle `doneMovingCallback`?
  // TODO: If it's a promise (resolve/reject), do we need to respond?
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
