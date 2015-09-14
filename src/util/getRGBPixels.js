(function(cornerstone, cornerstoneTools) {

    'use strict';

    function getRGBPixels(element, x, y, width, height) {
        if (!element) {
            throw 'getRGBPixels: parameter element must not be undefined';
        }

        x = Math.round(x);
        y = Math.round(y);
        var enabledElement = cornerstone.getEnabledElement(element);
        var storedPixelData = [];
        var index = 0;
        var pixelData = enabledElement.image.getPixelData();
        var spIndex,
            row,
            column;

        if (enabledElement.image.color) {
            for (row = 0; row < height; row++) {
                for (column = 0; column < width; column++) {
                    spIndex = (((row + y) * enabledElement.image.columns) + (column + x)) * 4;
                    var red = pixelData[spIndex];
                    var green = pixelData[spIndex + 1];
                    var blue = pixelData[spIndex + 2];
                    var alpha = pixelData[spIndex + 3];
                    storedPixelData[index++] = red;
                    storedPixelData[index++] = green;
                    storedPixelData[index++] = blue;
                    storedPixelData[index++] = alpha;
                }
            }
        }

        return storedPixelData;
    }

    // module exports
    cornerstoneTools.getRGBPixels = getRGBPixels;

})(cornerstone, cornerstoneTools);
