var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = "playClip";

    /**
     * Starts playing a clip or adjusts the frame rate of an already playing clip.  framesPerSecond is
     * optional and defaults to 30 if not specified.  A negative framesPerSecond will play the clip in reverse.
     * The element must be a stack of images
     * @param element
     * @param framesPerSecond
     */
    function playClip(element, framesPerSecond)
    {
        if(element === undefined) {
            throw "playClip: element must not be undefined";
        }
        if(framesPerSecond === undefined) {
            framesPerSecond = 30;
        }

        var stackToolData = cornerstoneTools.getToolState(element, 'stack');
        if (stackToolData === undefined || stackToolData.data === undefined || stackToolData.data.length === 0) {
            return;
       }
        var stackData = stackToolData.data[0];

        var playClipToolData = cornerstoneTools.getToolState(element, toolType);
        var playClipData;
        if (playClipToolData === undefined || playClipToolData.data.length === 0) {
            playClipData = {
                intervalId : undefined,
                framesPerSecond: framesPerSecond,
                lastFrameTimeStamp: undefined,
                frameRate: 0
            };
            cornerstoneTools.addToolState(element, toolType, playClipData);
        }
        else {
            playClipData = playClipToolData.data[0];
            playClipData.framesPerSecond = framesPerSecond;
        }

        playClipData.intervalId = setInterval(function() {

            var newImageIdIndex = stackData.currentImageIdIndex;
            if(playClipData.framesPerSecond > 0) {
                newImageIdIndex++;
            } else {
                newImageIdIndex--;
            }

            // loop around if we go outside the stack
            if (newImageIdIndex >= stackData.imageIds.length)
            {
                newImageIdIndex =0;
            }
            if(newImageIdIndex < 0) {
                newImageIdIndex = stackData.imageIds.length -1;
            }

            if(newImageIdIndex !== stackData.currentImageIdIndex)
            {
                var viewport = cornerstone.getViewport(element);
                cornerstone.loadImage(stackData.imageIds[newImageIdIndex]).then(function(image) {
                    stackData.currentImageIdIndex = newImageIdIndex;
                    cornerstone.displayImage(element, image, viewport);
                });
            }
        }, 1000/Math.abs(playClipData.framesPerSecond));
    }

    /**
     * Stops an already playing clip.
     * * @param element
     */
    function stopClip(element)
    {
        var playClipToolData = cornerstoneTools.getToolState(element, toolType);
        var playClipData;
        if (playClipToolData === undefined) {
            return;
        }
        else {
            playClipData = playClipToolData.data[0];
        }

        clearInterval(playClipData.intervalId);
        playClipData.intervalId = undefined;
    }


    // module/private exports
    cornerstoneTools.playClip = playClip;
    cornerstoneTools.stopClip = stopClip;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));