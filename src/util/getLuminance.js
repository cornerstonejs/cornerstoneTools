(function(cornerstone, cornerstoneTools) {

    'use strict';

    function getLuminance(element, x, y, width, height) {
        if (!element) {
            throw 'getLuminance: parameter element must not be undefined';
        }

        x = Math.round(x);
        y = Math.round(y);
        var enabledElement = cornerstone.getEnabledElement(element);
        var image = enabledElement.image;
        var luminance = [];
        var index = 0;
        var pixelData = image.getPixelData();
        var spIndex,
            row,
            column;

        if (image.color) {
            for (row = 0; row < height; row++) {
                for (column = 0; column < width; column++) {
                    spIndex = (((row + y) * image.columns) + (column + x)) * 4;
                    var red = pixelData[spIndex];
                    var green = pixelData[spIndex + 1];
                    var blue = pixelData[spIndex + 2];
                    luminance[index++] = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
                }
            }
        } else {
            for (row = 0; row < height; row++) {
                for (column = 0; column < width; column++) {
                    spIndex = ((row + y) * image.columns) + (column + x);
                    luminance[index++] = pixelData[spIndex] * image.slope + image.intercept;
                }
            }
        }

        return luminance;
    }

    // module exports
    cornerstoneTools.getLuminance = getLuminance;

})(cornerstone, cornerstoneTools);
