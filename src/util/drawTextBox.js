var cornerstoneTools = (function (cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function drawTextBox(context, text, x, y, color) {
        var padding = 5,
            font = cornerstoneTools.textStyle.getFont(),
            fontSize = cornerstoneTools.textStyle.getFontSize(),
            backgroundColor = cornerstoneTools.textStyle.getBackgroundColor();

        context.save();

        // Get the text width in the current font
        context.font = font;
        var width = context.measureText(text).width;

        // Draw the background box with padding
        context.textBaseline = 'top';
        context.fillStyle = backgroundColor;
        context.fillRect(x, y - fontSize, width + (padding * 2), fontSize + (padding * 2));
        
        // Draw the text
        context.fillStyle = color;
        context.fillText(text, x + padding, y - fontSize + padding);
        
        context.restore();
    }

    // module exports
    cornerstoneTools.drawTextBox = drawTextBox;

    return cornerstoneTools;
}(cornerstoneTools));