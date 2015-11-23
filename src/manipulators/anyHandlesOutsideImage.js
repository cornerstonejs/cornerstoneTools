(function($, cornerstone, cornerstoneMath, cornerstoneTools) {

    'use strict';

    function anyHandlesOutsideImage(renderData, handles) {
        var image = renderData.image;
        var imageRect = {
            left: 0,
            top: 0,
            width: image.width,
            height: image.height
        };

        var handleOutsideImage = false;

        Object.keys(handles).forEach(function(name) {
            var handle = handles[name];
            if (handle.allowedOutsideImage === true) {
                return;
            }
            
            if (cornerstoneMath.point.insideRect(handle, imageRect) === false) {
                handleOutsideImage = true;
            }
        });

        return handleOutsideImage;
    }

    // module/private exports
    cornerstoneTools.anyHandlesOutsideImage = anyHandlesOutsideImage;

})($, cornerstone, cornerstoneMath, cornerstoneTools);
