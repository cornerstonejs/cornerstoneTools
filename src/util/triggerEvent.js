import {
  external
} from '../externalModules.js';

/**
 * Trigger a CustomEvent
 *
 * @param {EventTarget} el The element or EventTarget to trigger the event upon
 * @param {String} type The event type name
 * @param {Object|null} detail=null The event data to be sent
 * @returns {boolean} The return value is false if at least one event listener called preventDefault(). Otherwise it returns true.
 */
export default function triggerEvent (el, type, detail = null) {
  const event = new CustomEvent(type.toLocaleLowerCase(), {
    detail,
    cancelable: true
  });

  // TODO: remove jQuery event triggers
  const jqEvent = external.$.Event(type, detail);

  external.$(el).trigger(jqEvent, detail);
  if (jqEvent.isImmediatePropagationStopped()) {
    return false;
  }

  return el.dispatchEvent(event);
}
