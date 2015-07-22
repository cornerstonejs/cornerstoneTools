(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function defaultStrategy(eventData) {
        var enabledElement = cornerstone.getEnabledElement(eventData.element);

        cornerstone.updateImage(eventData.element);

        var context = enabledElement.canvas.getContext('2d');
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
            x: eventData.currentPoints.image.x + 3, y: eventData.currentPoints.image.y - 3
        };
        var textCoords = cornerstone.pixelToCanvas(eventData.element, coords);
        
        context.font = font;
        context.fillStyle = color;
        var text = '' + x + ',' + y;
        var str = 'SP: ' + sp + ' MO: ' + parseFloat(mo.toFixed(3));
        if (suv) {
            str += ' SUV: ' + parseFloat(suv.toFixed(3));
        }

        cornerstoneTools.drawTextBox(context, str, textCoords.x, textCoords.y + fontHeight + 5, color);
        cornerstoneTools.drawTextBox(context, text, textCoords.x, textCoords.y, color);
        context.restore();
    }

    function minimalStrategy(eventData) {
        var enabledElement = cornerstone.getEnabledElement(eventData.element);

        cornerstone.updateImage(eventData.element);

        var context = enabledElement.canvas.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);

        var color = cornerstoneTools.toolColors.getActiveColor();
        var font = cornerstoneTools.textStyle.getFont();

        context.save();

        var x = Math.round(eventData.currentPoints.image.x);
        var y = Math.round(eventData.currentPoints.image.y);

        var storedPixels = cornerstone.getStoredPixels(eventData.element, x, y, 1, 1);
        var huValue = storedPixels[0] * eventData.image.slope + eventData.image.intercept;
        huValue = parseFloat(huValue.toFixed(3));

        // Draw text
        var coords = {
            // translate the x/y away from the cursor
            x: eventData.currentPoints.image.x + 4, y: eventData.currentPoints.image.y - 4
        };
        var textCoords = cornerstone.pixelToCanvas(eventData.element, coords);
        
        context.font = font;
        context.fillStyle = color;
        cornerstoneTools.drawTextBox(context, huValue, textCoords.x, textCoords.y, color);
        context.restore();
    }

    function mouseUpCallback(e, eventData) {
        $(eventData.element).off('CornerstoneToolsMouseDrag', onDrag);
        $(eventData.element).off('CornerstoneToolsMouseUp', mouseUpCallback);
        cornerstone.updateImage(eventData.element);
    }

    function mouseDownCallback(e, eventData) {
        if (cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            $(eventData.element).on('CornerstoneToolsMouseDrag', onDrag);
            $(eventData.element).on('CornerstoneToolsMouseUp', mouseUpCallback);
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
        default: defaultStrategy, minimal: minimalStrategy
    };
    cornerstoneTools.dragProbe.strategy = defaultStrategy;

    cornerstoneTools.dragProbeTouch = cornerstoneTools.touchDragTool(onDrag);

})($, cornerstone, cornerstoneTools);
