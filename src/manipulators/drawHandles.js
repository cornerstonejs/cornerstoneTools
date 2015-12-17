(function(cornerstone, cornerstoneTools) {

    'use strict';

    var handleRadius = 6;

    function drawHandles(context, renderData, handles, color, options) {
        context.strokeStyle = color;

        Object.keys(handles).forEach(function(name) {
            var handle = handles[name];
            if (handle.drawnIndependently === true) {
                return;
            }

            if (options && options.drawHandlesIfActive === true && !handle.active) {
                return;
            }

            context.beginPath();

            if (handle.active) {
                context.lineWidth = cornerstoneTools.toolStyle.getActiveWidth();
            } else {
                context.lineWidth = cornerstoneTools.toolStyle.getToolWidth();
            }

            var handleCanvasCoords = cornerstone.pixelToCanvas(renderData.element, handle);
            context.arc(handleCanvasCoords.x, handleCanvasCoords.y, handleRadius, 0, 2 * Math.PI);

            if (options && options.fill) {
                context.fillStyle = options.fill;
                context.fill();
            }

            context.stroke();
        });
    }

    // module/private exports
    cornerstoneTools.drawHandles = drawHandles;

})(cornerstone, cornerstoneTools);
