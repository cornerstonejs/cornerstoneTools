var cornerstoneTools = (function ($, cornerstone, cornerstoneMath, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = "arrow";

    ///////// BEGIN ACTIVE TOOL ///////
    function createNewMeasurement(mouseEventData)
    {
        // create the measurement data for this tool with the end handle activated
        var measurementData = {
            visible : true,
            handles : {
                start : {
                    x : mouseEventData.currentPoints.image.x,
                    y : mouseEventData.currentPoints.image.y,
                    highlight: false,
                    active: false
                },
                end: {
                    x : mouseEventData.currentPoints.image.x,
                    y : mouseEventData.currentPoints.image.y,
                    highlight: true,
                    active: true
                }
            }
        };

        return measurementData;
    }
    ///////// END ACTIVE TOOL ///////

    function pointNearTool(data, coords)
    {
        var lineSegment = {
            start: data.handles.start,
            end: data.handles.end
        };
        var distanceToPoint = cornerstoneMath.lineSegment.distanceToPoint(lineSegment, coords);
        return (distanceToPoint < 25);
    }

    /*
    Code for this function from: http://stackoverflow.com/a/16027466/910324
    */
    function drawArrowhead(ctx, x, y, radians) {
        ctx.save();
        ctx.beginPath();
        ctx.translate(x, y);
        ctx.rotate(radians);
        ctx.moveTo(0,0);
        ctx.lineTo(10,20);
        ctx.moveTo(0,0);
        ctx.lineTo(-10,20);
        // _drawDoubleLine([0,0], [10,20])
        // _drawDoubleLine([-1,0], [-10,20])
        ctx.stroke();
        ctx.restore();
    }

    ///////// BEGIN IMAGE RENDERING ///////
    function onImageRendered(e, eventData) {

        // if we have no toolData for this element, return immediately as there is nothing to do
        var toolData = cornerstoneTools.getToolState(e.currentTarget, toolType);
        if(toolData === undefined) {
            return;
        }

        // we have tool data for this element - iterate over each one and draw it
        var context = eventData.canvasContext.canvas.getContext("2d");
        cornerstone.setToPixelCoordinateSystem(eventData.enabledElement, context);
        
        var color=cornerstoneTools.activeToolcoordinate.getToolColor();
        
        for(var i=0; i < toolData.data.length; i++) {
            context.save();
            var data = toolData.data[i];
            if (pointNearTool(data, cornerstoneTools.activeToolcoordinate.getCoords())) {
               color = cornerstoneTools.activeToolcoordinate.getActiveColor();
            } else {
               color = cornerstoneTools.activeToolcoordinate.getToolColor();
            }

            var x1 = data.handles.start.x,
                y1 = data.handles.start.y,
                x2 = data.handles.end.x,
                y2 = data.handles.end.y;
         
            // draw the line
            context.beginPath();
            context.strokeStyle = color;
            context.lineWidth = 1 / eventData.viewport.scale;
            context.moveTo(x1, y1);
            context.lineTo(x2, y2);
            context.stroke();

            // draw the arrowhead
            /*var endRadians = Math.atan((y2 - y1) / (x2 - x1));
            endRadians += ((x2 >= x1) ? 90 : -90) * Math.PI / 180;*/

            var startRadians=Math.atan((y2-y1)/(x2-x1));
            startRadians+=((x2>x1)?-90:90)*Math.PI/180;

            drawArrowhead(context, x1, y1, startRadians);

            // draw the handles
            context.beginPath();
            cornerstoneTools.drawHandles(context, eventData, data.handles,color);
            context.stroke();

            context.restore();
        }

    }
    ///////// END IMAGE RENDERING ///////


    // module exports
    cornerstoneTools.arrow = cornerstoneTools.mouseButtonTool({
        createNewMeasurement : createNewMeasurement,
        onImageRendered: onImageRendered,
        pointNearTool : pointNearTool,
        toolType : toolType
    });
    cornerstoneTools.arrowTouch = cornerstoneTools.touchTool({
        createNewMeasurement: createNewMeasurement,
        onImageRendered: onImageRendered,
        pointNearTool: pointNearTool,
        toolType: toolType
    });
    return cornerstoneTools;
}($, cornerstone, cornerstoneMath, cornerstoneTools));
