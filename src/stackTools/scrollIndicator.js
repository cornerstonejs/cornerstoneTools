/*
Display scroll progress bar across bottom of image.
 */
(function($, cornerstone, cornerstoneTools) {

    'use strict';

    var scrollBarHeight = 6;

    var configuration = {
        backgroundColor: 'rgb(19, 63, 141)',
        fillColor: 'white'
    };

    function onImageRendered(e, eventData){
        var element = eventData.element;
        var width = eventData.enabledElement.canvas.width;
        var height = eventData.enabledElement.canvas.height;

        if (!width || !height) {
            return false;
        }

        var context = eventData.enabledElement.canvas.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.save();

        var config = cornerstoneTools.scrollIndicator.getConfiguration();

        // draw indicator background
        context.fillStyle = config.backgroundColor;
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

        context.fillStyle = config.fillColor;
        context.fillRect(xPosition, height - scrollBarHeight, cursorWidth, scrollBarHeight);

        context.restore();
    }

    cornerstoneTools.scrollIndicator = cornerstoneTools.displayTool(onImageRendered);
    cornerstoneTools.scrollIndicator.setConfiguration(configuration);

})($, cornerstone, cornerstoneTools);
