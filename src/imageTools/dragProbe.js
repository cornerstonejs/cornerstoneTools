var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function defaultStrategy(eventData) {
        var enabledElement = cornerstone.getEnabledElement(eventData.element);
        var image = enabledElement.image;

        cornerstone.updateImage(eventData.element);

        var context = enabledElement.canvas.getContext("2d");
        context.setTransform(1, 0, 0, 1, 0, 0);

        var color = cornerstoneTools.toolColors.getActiveColor();
        var font = cornerstoneTools.textStyle.getFont();
        var fontHeight = cornerstoneTools.textStyle.getFontSize();

        context.save();

        var x = Math.round(eventData.currentPoints.image.x);
        var y = Math.round(eventData.currentPoints.image.y);

        var storedPixels = cornerstone.getStoredPixels(eventData.element, x, y, 1, 1);
        var sp = storedPixels[0];
        var mo = sp * eventData.image.slope + eventData.image.intercept;
        var suv = cornerstoneTools.calculateSUV(eventData.image, sp);

        // Draw text
        var coords = {
            // translate the x/y away from the cursor
            x: eventData.currentPoints.image.x + 3,
            y: eventData.currentPoints.image.y - 3
        };
        var textCoords = cornerstone.pixelToCanvas(eventData.element, coords);
        
        context.font = font;
        context.fillStyle = color;
        context.fillText("" + x + "," + y, textCoords.x, textCoords.y);
        var str = "SP: " + sp + " MO: " + mo.toFixed(3);
        if (suv) {
            str += " SUV: " + suv.toFixed(3);
        }
        context.fillText(str, textCoords.x, textCoords.y + fontHeight);

        context.restore();
    }

    function mouseUpCallback(e, eventData) {
        $(eventData.element).off("CornerstoneToolsMouseDrag", onDrag);
        $(eventData.element).off("CornerstoneToolsMouseUp", mouseUpCallback);
        cornerstone.updateImage(eventData.element);
    }

    function mouseDownCallback(e, eventData) {
        if(cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            $(eventData.element).on("CornerstoneToolsMouseDrag", onDrag);
            $(eventData.element).on("CornerstoneToolsMouseUp", mouseUpCallback);
            cornerstoneTools.dragProbe.strategy(eventData);
            return false; // false = causes jquery to preventDefault() and stopPropagation() this event
        }
    }

    function onDrag(e, eventData) {
        cornerstoneTools.dragProbe.strategy(eventData);
        return false; // false = causes jquery to preventDefault() and stopPropagation() this event
    }

    cornerstoneTools.dragProbe = cornerstoneTools.simpleMouseButtonTool(mouseDownCallback);
    
    cornerstoneTools.dragProbe.strategies = {
        default : defaultStrategy,
    };
    cornerstoneTools.dragProbe.strategy = defaultStrategy;

    cornerstoneTools.dragProbeTouch = cornerstoneTools.touchDragTool(onDrag);

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
