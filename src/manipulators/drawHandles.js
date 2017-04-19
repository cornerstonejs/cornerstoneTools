(function(cornerstone, cornerstoneTools) {

    'use strict';

    var handleRadius = 6;

    function drawHandles(context, renderData, handles, color, options) {
        context.strokeStyle = color;

        Object.keys(handles).forEach(function(name) {
            var handle = handles[name];
            var radius = handleRadius;
            if (handle.drawnIndependently === true) {
                return;
            }

            if (options && options.drawHandlesIfActive === true && !handle.active) {
                return;
            }

            if (options && options.handleRadius) {
                radius = Number(options.handleRadius);
            }

            context.beginPath();

            if (handle.active) {
                context.lineWidth = cornerstoneTools.toolStyle.getActiveWidth();
            } else {
                context.lineWidth = cornerstoneTools.toolStyle.getToolWidth();
            }

            var handleCanvasCoords = cornerstone.pixelToCanvas(renderData.element, handle);
            context.arc(handleCanvasCoords.x, handleCanvasCoords.y, radius, 0, 2 * Math.PI);
            context.shadowColor = 'rgba(80,80,80,0.8)';
            context.shadowOffsetX = 1;
            context.shadowOffsetY = 1;
            context.shadowBlur = 5;
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
