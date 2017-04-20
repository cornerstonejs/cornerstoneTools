(function(cornerstoneTools) {

    'use strict';

    // Thanks to @joelambert
    // https://gist.github.com/joelambert/1002116

    /**
        	 * Behaves the same as clearTimeout except uses cancelRequestAnimationFrame() where possible for better performance
        	 * @param {int|object} fn The callback function
        	 */
    function clearRequestTimeout(handle) {
        // TODO: Make a cornerstone.cancelAnimationFrame
        var cancelAnimationFrame = window.cancelAnimationFrame ? window.cancelAnimationFrame :
            window.webkitCancelAnimationFrame ? window.webkitCancelAnimationFrame :
            window.webkitCancelRequestAnimationFrame ? window.webkitCancelRequestAnimationFrame : /* Support for legacy API */
            window.mozCancelRequestAnimationFrame ? window.mozCancelRequestAnimationFrame :
            window.oCancelRequestAnimationFrame	? window.oCancelRequestAnimationFrame :
            window.msCancelRequestAnimationFrame;

        if (cancelAnimationFrame) {
            cancelAnimationFrame(handle.value);
        } else {
            clearTimeout(handle);
        }
    }

    cornerstoneTools.clearRequestTimeout = clearRequestTimeout;

})(cornerstoneTools);
