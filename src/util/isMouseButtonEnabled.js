(function(cornerstone, cornerstoneTools) {

    'use strict';

    function isMouseButtonEnabled(which, mouseButtonMask) {
        /*jshint bitwise: false*/
        var mouseButton = (1 << (which - 1));
        return ((mouseButtonMask & mouseButton) !== 0);
    }

    // module exports
    cornerstoneTools.isMouseButtonEnabled = isMouseButtonEnabled;

})(cornerstone, cornerstoneTools);
