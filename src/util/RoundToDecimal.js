var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function roundToDecimal(value, precision) {
        var multiplier = Math.pow(10, precision);

        return (Math.round(value * multiplier) / multiplier);
    }

    // module exports
    cornerstoneTools.roundToDecimal = roundToDecimal;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));