import EVENTS from '../events.js';
import triggerEvent from './triggerEvent.js';

/**
 * Fire cornerstonetoolsmeasurementcompleted event on provided element
 * @param {any} element which freehand data has been modified
 * @param {any} data the measurment data
 * @param {String} toolType of the measurement tool data being fired.
 * @returns {void}
 */
export default function(element, data, toolType) {
  const eventType = EVENTS.MEASUREMENT_COMPLETED;
  const completedEventData = {
    toolType,
    element,
    measurementData: data,
  };

  triggerEvent(element, eventType, completedEventData);
}
