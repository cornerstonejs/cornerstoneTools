import EVENTS from '../events.js';
import external from '../externalModules.js';
import triggerEvent from '../util/triggerEvent.js';

// This object manages a collection of measurements
function MeasurementManager () {
  const cornerstone = external.cornerstone;
  const that = this;

  that.measurements = [];

  // Adds an element as both a source and a target
  this.add = function (measurement) {
    const index = that.measurements.push(measurement);
    // Fire event
    const eventDetail = {
      index,
      measurement
    };

    triggerEvent(cornerstone.events, EVENTS.MEASUREMENT_ADDED, eventDetail);
  };

  this.remove = function (index) {
    const measurement = that.measurements[index];

    that.measurements.splice(index, 1);
    // Fire event
    const eventDetail = {
      index,
      measurement
    };

    triggerEvent(cornerstone.events, EVENTS.MEASUREMENT_REMOVED, eventDetail);
  };

}

// Module/private exports
const manager = new MeasurementManager();

export default manager;
