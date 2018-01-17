import EVENTS from '../events.js';
import external from '../externalModules.js';
import triggerEvent from '../util/triggerEvent.js';

// This object manages a collection of measurements
export default function () {
  const cornerstone = external.cornerstone;
  const that = this;

  that.samples = [];

  this.set = function (samples) {
    that.samples = samples;
    // Fire event
    triggerEvent(cornerstone.events, EVENTS.LINE_SAMPLE_UPDATED);
  };
}
