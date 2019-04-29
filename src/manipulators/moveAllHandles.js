import EVENTS from '../events.js';
import external from '../externalModules.js';
import anyHandlesOutsideImage from './anyHandlesOutsideImage.js';
import { removeToolState } from '../stateManagement/toolState.js';
import triggerEvent from '../util/triggerEvent.js';
import { clipToBox } from '../util/clip.js';
import { state } from './../store/index.js';
import getActiveTool from '../util/getActiveTool';
import BaseAnnotationTool from '../tools/base/BaseAnnotationTool';

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
 * Manipulator to move all provided handles at the same time
 * @public
 * @function moveAllHandles
 * @memberof Manipulators
 *
 * @param {*}        evtDetail
 * @param {*}        evtDetail.element
 * @param {String}   toolName
 * @param {*}        annotation
 * @param {*}        [handle=null] - not needed by moveAllHandles, but keeps call signature the same as `moveHandle`
 * @param {Object}   [options={}]
 * @param {Boolean}  [options.deleteIfHandleOutsideImage]
 * @param {function} [options.doneMovingCallback]
 * @param {Boolean}  [options.preventHandleOutsideImage]
 * @param {string}   [interactionType=mouse]
 * @returns {undefined}
 */
export default function(
  { element },
  toolName,
  annotation,
  handle,
  options = {},
  interactionType = 'mouse'
) {
  // Use global defaults, unless overidden by provided options
  options = Object.assign(
    {
      deleteIfHandleOutsideImage: state.deleteIfHandleOutsideImage,
      preventHandleOutsideImage: state.preventHandleOutsideImage,
    },
    options
  );

  const dragHandler = _dragHandler.bind(
    this,
    toolName,
    annotation,
    options,
    interactionType
  );
  // So we don't need to inline the entire `upOrEndHandler` function
  const upOrEndHandler = evt => {
    _upOrEndHandler(
      toolName,
      annotation,
      options,
      interactionType,
      {
        dragHandler,
        upOrEndHandler,
      },
      evt
    );
  };

  annotation.active = true;
  state.isToolLocked = true;

  // Add Event Listeners
  _dragEvents[interactionType].forEach(eventType => {
    element.addEventListener(eventType, dragHandler);
  });
  _upOrEndEvents[interactionType].forEach(eventType => {
    element.addEventListener(eventType, upOrEndHandler);
  });
}

function _dragHandler(
  toolName,
  annotation,
  options = {},
  interactionType,
  evt
) {
  const { element, image, buttons } = evt.detail;
  const { x, y } = evt.detail.deltaPoints.image;

  annotation.active = true;
  annotation.invalidated = true;

  const handleKeys = Object.keys(annotation.handles);

  for (let i = 0; i < handleKeys.length; i++) {
    const key = handleKeys[i];
    const handle = annotation.handles[key];

    if (
      // Don't move this part of the annotation
      handle.movesIndependently === true ||
      // Not a true handle
      !handle.hasOwnProperty('x') ||
      !handle.hasOwnProperty('y')
    ) {
      continue;
    }

    handle.x += x;
    handle.y += y;

    if (options.preventHandleOutsideImage) {
      clipToBox(handle, image);
    }
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

  evt.preventDefault();
  evt.stopPropagation();
}

function _upOrEndHandler(
  toolName,
  annotation,
  options = {},
  interactionType,
  { dragHandler, upOrEndHandler },
  evt
) {
  const eventData = evt.detail;
  const element = evt.detail.element;

  annotation.active = false;
  annotation.invalidated = true;
  state.isToolLocked = false;

  // Remove Event Listeners
  _dragEvents[interactionType].forEach(eventType => {
    element.removeEventListener(eventType, dragHandler);
  });
  _upOrEndEvents[interactionType].forEach(eventType => {
    element.removeEventListener(eventType, upOrEndHandler);
  });

  // If any handle is outside the image, delete the tool data
  if (
    options.deleteIfHandleOutsideImage &&
    anyHandlesOutsideImage(eventData, annotation.handles)
  ) {
    removeToolState(element, toolName, annotation);
  }

  if (typeof options.doneMovingCallback === 'function') {
    options.doneMovingCallback();
  }

  external.cornerstone.updateImage(element);
}
