/*
Display scroll progress bar across bottom of image.
 */
(function($, cornerstone, cornerstoneTools) {

    "use strict";

    var scrollBarHeight = 6;

    function onImageRendered(e, eventData){
        var element = eventData.element;
        var width = eventData.enabledElement.canvas.width;
        var height = eventData.enabledElement.canvas.height;

        if (!width || !height) {
             // image not actually rendered yet, not sure what's going on here
            return false;
        }


        var context = eventData.enabledElement.canvas.getContext("2d");
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.save();

        // draw indicator background
        context.fillStyle = 'rgb(19, 63, 141)';
        context.fillRect(0, height - scrollBarHeight, width, scrollBarHeight);

        // get current image index
        var stackData = cornerstoneTools.getToolState(element, 'stack');
        if (!stackData || !stackData.data || !stackData.data.length) {
            return;
        }
        var imageIds = stackData.data[0].imageIds;
        var currentImageIdIndex = stackData.data[0].currentImageIdIndex;

        // draw current image cursor
        var cursorWidth = width / imageIds.length;
        var xPosition = cursorWidth * currentImageIdIndex;

        context.fillStyle = 'white';
        context.fillRect(xPosition, height - scrollBarHeight, cursorWidth, scrollBarHeight);

        context.restore();
    }

    function disable(element) {
        $(element).off("CornerstoneImageRendered", onImageRendered);
    }

    function enable(element) {
        cornerstoneTools.scrollIndicator.disable(element);
        $(element).on("CornerstoneImageRendered", onImageRendered);
    }
    
    cornerstoneTools.scrollIndicator = {
        enable: enable,
        disable: disable
    };

})($, cornerstone, cornerstoneTools);