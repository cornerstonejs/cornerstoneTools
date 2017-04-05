(function(cornerstoneTools) {

    'use strict';

    // Thanks to @joelambert
    // https://gist.github.com/joelambert/1002116

    /**
     * Behaves the same as setTimeout except uses requestAnimationFrame() where possible for better performance
     * @param {function} fn The callback function
     * @param {int} delay The delay in milliseconds
     */

    function requestTimeout(fn, delay) {
        if ( !window.requestAnimationFrame &&
            !window.webkitRequestAnimationFrame &&
            !(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && // Firefox 5 ships without cancel support
            !window.oRequestAnimationFrame &&
            !window.msRequestAnimationFrame) {
            return window.setTimeout(fn, delay);
        }

        var start = new Date().getTime(),
            handle = {};

        function loop(){
            var current = new Date().getTime(),
                delta = current - start;

            if (delta >= delay) {
                fn.call();
            } else {
                handle.value = cornerstone.requestAnimationFrame(loop);
            }
        }

        handle.value = cornerstone.requestAnimationFrame(loop);
        return handle;
    }

    cornerstoneTools.requestTimeout = requestTimeout;

})(cornerstoneTools);
