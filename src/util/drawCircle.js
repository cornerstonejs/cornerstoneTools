(function(cornerstoneTools) {

    'use strict';

    function drawCircle(context, start, color, lineWidth) {
        var handleRadius = 6;
        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.arc(start.x, start.y, handleRadius, 0, 2 * Math.PI);
        context.stroke();
    }

    // Module exports
    cornerstoneTools.drawCircle = drawCircle;

})(cornerstoneTools);
