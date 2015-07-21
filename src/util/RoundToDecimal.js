(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function roundToDecimal(value, precision) {
        var multiplier = Math.pow(10, precision);
        return (Math.round(value * multiplier) / multiplier);
    }

    // module exports
    cornerstoneTools.roundToDecimal = roundToDecimal;

})($, cornerstone, cornerstoneTools);
