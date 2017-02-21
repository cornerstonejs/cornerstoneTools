(function(cornerstoneTools) {

    'use strict';

    function requestAnimFrame(callback) {
        // This functionality was moved to cornerstone.
        console.warn('cornerstoneTools.requestAnimFrame() is deprecated, consider using cornerstone.requestAnimationFrame()');
        cornerstone.requestAnimationFrame(callback);
    }

    // Module exports
    cornerstoneTools.requestAnimFrame = requestAnimFrame;

})(cornerstoneTools);
