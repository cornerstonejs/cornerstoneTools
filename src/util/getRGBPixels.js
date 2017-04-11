(function(cornerstone, cornerstoneTools) {

    'use strict';

    var rgb_pixels_cache;

    function getRGBPixels(element, x, y, width, height) {
        if (!element) {
            throw 'getRGBPixels: parameter element must not be undefined';
        }

        x = Math.round(x);
        y = Math.round(y);
        var enabledElement = cornerstone.getEnabledElement(element);
        var storedPixelData = [];
        var pixelData;
        var spIndex,
            row,
            column;

        var image_id = enabledElement.image.imageId;
        if (rgb_pixels_cache === undefined || rgb_pixels_cache.id !== image_id){
            pixelData = enabledElement.image.getPixelData();
            rgb_pixels_cache = {
                id: image_id,
                pixels: pixelData
            };
        }else {
            pixelData = rgb_pixels_cache.pixels;
        }

        if (enabledElement.image.color) {
            // special case inside probe tool
            if (width === 1 && height === 1){
                spIndex = ((y * enabledElement.image.columns) + x) * 4;
                return [
                  pixelData[spIndex],
                  pixelData[spIndex + 1],
                  pixelData[spIndex + 2],
                  pixelData[spIndex + 3],
                ];
            }

            storedPixelData = new Array(4 * width * height);
            var index = 0;
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
