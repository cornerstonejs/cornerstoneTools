(function(cornerstoneTools) {

    'use strict';

    function requestFrame(callback) {
        window.setTimeout(callback, 1000 / 60);
    }

    function requestAnimFrame(callback) {
        return window.requestAnimationFrame(callback) ||
               window.webkitRequestAnimationFrame(callback) ||
               window.mozRequestAnimationFrame(callback) ||
               window.oRequestAnimationFrame(callback) ||
               window.msRequestAnimationFrame(callback) ||
               requestFrame(callback);
    }

    // Module exports
    cornerstoneTools.requestAnimFrame = requestAnimFrame;

})(cornerstoneTools);
