// This object manages a collection of measurements
function MeasurementManager () {
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

    $(that).trigger('CornerstoneMeasurementAdded', eventDetail);
  };

  this.remove = function (index) {
    const measurement = that.measurements[index];

    that.measurements.splice(index, 1);
    // Fire event
    const eventDetail = {
      index,
      measurement
    };

    $(that).trigger('CornerstoneMeasurementRemoved', eventDetail);
  };

}

// Module/private exports
const manager = new MeasurementManager();

export default manager;
