(function(cornerstoneTools) {

    'use strict';

    function drawTextBox(context, textLines, x, y, color) {
        if (Object.prototype.toString.call(textLines) !== '[object Array]') {
            textLines = [ textLines ];
        }

        var padding = 5,
            font = cornerstoneTools.textStyle.getFont(),
            fontSize = cornerstoneTools.textStyle.getFontSize(),
            backgroundColor = cornerstoneTools.textStyle.getBackgroundColor();

        context.save();
        context.font = font;
        context.textBaseline = 'top';
        context.strokeStyle = color;

        // Find the longest text width in the array of text data
        var maxWidth = 0;
        textLines.forEach(function(text) {
            // Get the text width in the current font
            var width = context.measureText(text).width;

            // Find the maximum with for all the text rows;
            maxWidth = Math.max(maxWidth, width);
        });

        // Draw the background box with padding
        context.fillStyle = backgroundColor;

        // Calculate the bounding box for this text box
        var boundingBox = {
            left: x,
            top: y,
            width: maxWidth + (padding * 2),
            height: textLines.length * (fontSize + (padding * 2))
        };
        context.fillRect(boundingBox.left, boundingBox.top, boundingBox.width, boundingBox.height);

        // Draw each of the text lines on top of the background box
        textLines.forEach(function(text, index) {
            context.fillStyle = color;
            context.fillText(text, x + padding, y + fontSize * index + padding);

        });

        context.restore();

        // Return the bounding box so it can be used for pointNearHandle
        return boundingBox;
    }

    // module exports
    cornerstoneTools.drawTextBox = drawTextBox;

})(cornerstoneTools);
