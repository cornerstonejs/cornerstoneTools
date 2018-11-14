import EVENTS from '../events.js';
import external from '../externalModules.js';
import anyHandlesOutsideImage from './anyHandlesOutsideImage.js';
import { removeToolState } from '../stateManagement/toolState.js';
import triggerEvent from '../util/triggerEvent.js';
import { clipToBox } from '../util/clip.js';

/**
 * Manipulator to move all provided handles at the same time
 * @public
 * @function moveAllHandles
 * @memberof Manipulators
 *
 * @param {*} element
 * @param {String} toolName
 * @param {*} annotation
 * @param {Object}  [options={}]
 * @param {Boolean} [options.preventHandleOutsideImage]
 * @param {Boolean} [options.deleteIfHandleOutsideImage]
 * @param {function} [doneMovingCallback]
 * @param {string} [interactionType=mouse]
 * @returns {undefined}
 */
export default function(
  element,
  toolName,
  annotation,
  options = {},
  doneMovingCallback,
  interactionType = 'mouse'
) {
  const dragHandler = _dragHandler.bind(this, toolName, annotation, options);
  const upOrEndHandler = _upOrEndHandler.bind(
    this,
    toolName,
    annotation,
    options,
    doneMovingCallback
  );

  if (interactionType === 'mouse') {
    element.addEventListener(EVENTS.MOUSE_DRAG, dragHandler);
    element.addEventListener(EVENTS.MOUSE_UP, upOrEndHandler);
    element.addEventListener(EVENTS.MOUSE_CLICK, upOrEndHandler);
  } else {
    element.addEventListener(EVENTS.TOUCH_DRAG, dragHandler);
    element.addEventListener(EVENTS.TOUCH_PINCH, upOrEndHandler);
    element.addEventListener(EVENTS.TOUCH_PRESS, upOrEndHandler);
    element.addEventListener(EVENTS.TOUCH_END, upOrEndHandler);
    element.addEventListener(EVENTS.TOUCH_DRAG_END, upOrEndHandler);
    element.addEventListener(EVENTS.TAP, upOrEndHandler);
  }
}

function _dragHandler(toolName, annotation, options = {}, evt) {
  const { element, image } = evt.detail.element;
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
  doneMovingCallback,
  evt
) {
  console.log('mouseUp-this:', this);
  const eventData = evt.detail;
  const element = evt.detail.element;

  annotation.active = false;
  annotation.invalidated = true;

  if (this.interactionType === 'mouse') {
    element.removeEventListener(EVENTS.MOUSE_DRAG, this.dragHandler);
    element.removeEventListener(EVENTS.MOUSE_UP, this.upOrEndHandler);
    element.removeEventListener(EVENTS.MOUSE_CLICK, this.upOrEndHandler);
  } else {
    element.removeEventListener(EVENTS.TOUCH_DRAG, this.dragHandler);
    element.removeEventListener(EVENTS.TOUCH_PINCH, this.upOrEndHandler);
    element.removeEventListener(EVENTS.TOUCH_PRESS, this.upOrEndHandler);
    element.removeEventListener(EVENTS.TOUCH_END, this.upOrEndHandler);
    element.removeEventListener(EVENTS.TOUCH_DRAG_END, this.upOrEndHandler);
    element.removeEventListener(EVENTS.TAP, this.upOrEndHandler);
  }

  // If any handle is outside the image, delete the tool data
  if (
    options.deleteIfHandleOutsideImage === true &&
    anyHandlesOutsideImage(eventData, annotation.handles)
  ) {
    removeToolState(this.element, toolName, annotation);
  }

  external.cornerstone.updateImage(this.element);

  if (typeof doneMovingCallback === 'function') {
    doneMovingCallback();
  }
}
