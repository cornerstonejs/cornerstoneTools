(function ($, cornerstone, cornerstoneMath, cornerstoneTools) {

    "use strict";

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
            if(cornerstoneMath.point.insideRect(handle, imageRect) === false)
            {
                handleOutsideImage = true;
            }
        }
        return handleOutsideImage;
    }

    // module/private exports
    cornerstoneTools.anyHandlesOutsideImage = anyHandlesOutsideImage;

})($, cornerstone, cornerstoneMath, cornerstoneTools);