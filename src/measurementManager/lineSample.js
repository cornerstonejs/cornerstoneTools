(function($, cornerstoneTools) {

    'use strict';

    // This object manages a collection of measurements
    function LineSampleMeasurement() {

        var that = this;
        that.samples = [];

        // adds an element as both a source and a target
        this.set = function(samples) {
            that.samples = samples;
            // fire event
            $(that).trigger('CornerstoneLineSampleUpdated');
        };
    }

    // module/private exports
    cornerstoneTools.LineSampleMeasurement = LineSampleMeasurement;

})($, cornerstoneTools);
