import EVENTS from '../events.js';
import external from '../externalModules.js';
import anyHandlesOutsideImage from './anyHandlesOutsideImage.js';
import { removeToolState } from '../stateManagement/toolState.js';
import triggerEvent from '../util/triggerEvent.js';
import { clipToBox } from '../util/clip.js';
import { state } from './../store/index.js';

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
  handle = null,
  options = {},
  interactionType = 'mouse'
) {
  const dragHandler = _dragHandler.bind(this, toolName, annotation, options);
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

function _dragHandler(toolName, annotation, options = {}, evt) {
  const { element, image } = evt.detail;
  const { x, y } = evt.detail.deltaPoints.image;

  annotation.active = true;

  Object.keys(annotation.handles).forEach(function(name) {
    const handle = annotation.handles[name];

    if (handle.movesIndependently === true) {
      return;
    }

    handle.x += x;
    handle.y += y;

    if (options.preventHandleOutsideImage) {
      clipToBox(handle, image);
    }
  });

  external.cornerstone.updateImage(element);

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
