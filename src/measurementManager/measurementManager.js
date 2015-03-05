var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    // This object manages a collection of measurements
    function MeasurementManager() {

        var that = this;
        that.measurements = [];

        // adds an element as both a source and a target
        this.add = function(measurement) {
            var index = that.measurements.push(measurement);
            // fire event
            var eventDetail = {
                index: index,
                measurement: measurement
            };
            $(that).trigger("CornerstoneMeasurementAdded", eventDetail);
        };

        this.remove = function(index) {
            var measurement = that.measurements[index];
            that.measurements.splice(index, 1);
            // fire event
            var eventDetail = {
                index: index,
                measurement: measurement
            };
            $(that).trigger("CornerstoneMeasurementRemoved", eventDetail);
        };

    }

    // module/private exports
    cornerstoneTools.MeasurementManager = new MeasurementManager();
    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));