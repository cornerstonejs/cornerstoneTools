(function(cornerstoneTools) {

    'use strict';

    // Thanks to @joelambert
    // https://gist.github.com/joelambert/1002116

    /**
	 * Behaves the same as setInterval except uses requestAnimationFrame() where possible for better performance
	 * @param {function} fn The callback function
	 * @param {int} delay The delay in milliseconds
	 */
    function requestInterval(fn, delay) {
        if ( !window.requestAnimationFrame &&
			!window.webkitRequestAnimationFrame &&
			!(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && // Firefox 5 ships without cancel support
        	!window.oRequestAnimationFrame &&
			!window.msRequestAnimationFrame) {
            return window.setInterval(fn, delay);
        }

        var start = new Date().getTime(),
            handle = {};

        function loop() {
            var current = new Date().getTime();
            var delta = current - start;

            if (delta >= delay) {
                fn.call();
                start = new Date().getTime();
            }

            handle.value = cornerstone.requestAnimationFrame(loop);
        }

        handle.value = cornerstone.requestAnimationFrame(loop);
        return handle;
    }

    cornerstoneTools.requestInterval = requestInterval;

})(cornerstoneTools);
