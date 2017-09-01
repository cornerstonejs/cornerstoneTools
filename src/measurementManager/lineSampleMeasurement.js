// This object manages a collection of measurements
import $ from '../jquery.js';

export default function () {

  const that = this;

  that.samples = [];

  // Adds an element as both a source and a target
  this.set = function (samples) {
    that.samples = samples;
    // Fire event
    $(that).trigger('CornerstoneLineSampleUpdated');
  };
}
