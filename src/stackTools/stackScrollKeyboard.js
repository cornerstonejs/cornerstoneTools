var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = "stackScrollKeyboard";

    var keys = {
        UP: 38,
        DOWN: 40
    };

    function scroll(element, images)
    {
        var toolData = cornerstoneTools.getToolState(element, 'stack');
        if(toolData === undefined || toolData.data === undefined || toolData.data.length === 0) {
            return;
        }

        var stackData = toolData.data[0];

        var newImageIdIndex = stackData.currentImageIdIndex + images;
        newImageIdIndex = Math.min(stackData.imageIds.length - 1, newImageIdIndex);
        newImageIdIndex = Math.max(0, newImageIdIndex);

        if(newImageIdIndex !== stackData.currentImageIdIndex)
        {
            var viewport = cornerstone.getViewport(element);
            cornerstone.loadAndCacheImage(stackData.imageIds[newImageIdIndex]).then(function(image) {
                stackData = toolData.data[0];
                if(stackData.newImageIdIndex !== newImageIdIndex) {
                    stackData.currentImageIdIndex = newImageIdIndex;
                    cornerstone.displayImage(element, image, viewport);
                }
            });
        }
    }

    function keyDownCallback(e, eventData)
    {
        var keyCode = eventData.keyCode;
        if (keyCode !== keys.UP && keyCode !== keys.DOWN) {
            return;
        }

        var images = 1;
        if (keyCode === keys.DOWN) {
            images = -1;
        }
        scroll(eventData.element, images);
        //console.log('Scrolled: ' + images + ' image(s)');
    }


    // module/private exports
    cornerstoneTools.stackScrollKeyboard = cornerstoneTools.keyboardTool(keyDownCallback);

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));