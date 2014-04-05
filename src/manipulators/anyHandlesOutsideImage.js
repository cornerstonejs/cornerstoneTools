var cornerstoneTools = (function ($, cornerstone, csc, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function anyHandlesOutsideImage(renderData, handles)
    {
        var image = renderData.image;
        var imageRect = {
            left: 0,
            top: 0,
            width: image.width,
            height: image.height
        };

        var handleOutsideImage = false;
        for(var property in handles) {
            var handle = handles[property];
            if(cornerstoneTools.point.insideRect(handle, imageRect) === false)
            {
                handleOutsideImage = true;
            }
        }
        return handleOutsideImage;
    }

    // module/private exports
    cornerstoneTools.anyHandlesOutsideImage = anyHandlesOutsideImage;

    return cornerstoneTools;
}($, cornerstone, cornerstoneCore, cornerstoneTools));