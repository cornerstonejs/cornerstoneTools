(function($, cornerstone, cornerstoneTools) {

    'use strict';

    var toolType = 'playClip';

    /**
     * Starts playing a clip or adjusts the frame rate of an already playing clip.  framesPerSecond is
     * optional and defaults to 30 if not specified.  A negative framesPerSecond will play the clip in reverse.
     * The element must be a stack of images
     * @param element
     * @param framesPerSecond
     */
    function playClip(element, framesPerSecond) {
        if (element === undefined) {
            throw 'playClip: element must not be undefined';
        }

        var stackToolData = cornerstoneTools.getToolState(element, 'stack');
        if (!stackToolData || !stackToolData.data || !stackToolData.data.length) {
            return;
        }

        var stackData = stackToolData.data[0];

        var playClipToolData = cornerstoneTools.getToolState(element, toolType);
        var playClipData;
        
        if (!playClipToolData || !playClipToolData.data || !playClipToolData.data.length) {
            playClipData = {
                intervalId: undefined,
                framesPerSecond: 30,
                lastFrameTimeStamp: undefined,
                frameRate: 0,
                loop: true
            };
            cornerstoneTools.addToolState(element, toolType, playClipData);
        } else {
            playClipData = playClipToolData.data[0];
        }

        // If a framerate is specified, update the playClipData now
        if (framesPerSecond) {
            playClipData.framesPerSecond = framesPerSecond;
        }

        // if already playing, do not set a new interval
        if (playClipData.intervalId !== undefined) {
            return;
        }

        playClipData.intervalId = setInterval(function() {
            var newImageIdIndex = stackData.currentImageIdIndex;

            if (playClipData.framesPerSecond > 0) {
                newImageIdIndex++;
            } else {
                newImageIdIndex--;
            }

            if (!playClipData.loop && (newImageIdIndex >= stackData.imageIds.length || newImageIdIndex < 0)) {
                var eventDetail = {
                    element: element
                };

                var event = $.Event('CornerstoneToolsClipStopped', eventDetail);
                $(element).trigger(event, eventDetail);

                clearInterval(playClipData.intervalId);
                playClipData.intervalId = undefined;
                return;
            }

            // loop around if we go outside the stack
            if (newImageIdIndex >= stackData.imageIds.length) {
                newImageIdIndex = 0;
            }

            if (newImageIdIndex < 0) {
                newImageIdIndex = stackData.imageIds.length - 1;
            }

            if (newImageIdIndex !== stackData.currentImageIdIndex) {
                var startLoadingHandler = cornerstoneTools.loadHandlerManager.getStartLoadHandler();
                var endLoadingHandler = cornerstoneTools.loadHandlerManager.getEndLoadHandler();
                var errorLoadingHandler = cornerstoneTools.loadHandlerManager.getErrorLoadingHandler();

                if (startLoadingHandler) {
                    startLoadingHandler(element);
                }

                var viewport = cornerstone.getViewport(element);

                var loader;
                if (stackData.preventCache === true) {
                    loader = cornerstone.loadImage(stackData.imageIds[newImageIdIndex]);
                } else {
                    loader = cornerstone.loadAndCacheImage(stackData.imageIds[newImageIdIndex]);
                }

                loader.then(function(image) {
                    stackData.currentImageIdIndex = newImageIdIndex;
                    cornerstone.displayImage(element, image, viewport);
                    if (endLoadingHandler) {
                        endLoadingHandler(element);
                    }
                }, function(error) {
                    var imageId = stackData.imageIds[newImageIdIndex];
                    if (errorLoadingHandler) {
                        errorLoadingHandler(element, imageId, error);
                    }
                });
            }
        }, 1000 / Math.abs(playClipData.framesPerSecond));
    }

    /**
     * Stops an already playing clip.
     * * @param element
     */
    function stopClip(element) {
        var playClipToolData = cornerstoneTools.getToolState(element, toolType);
        if (!playClipToolData || !playClipToolData.data || !playClipToolData.data.length) {
            return;
        }

        var playClipData = playClipToolData.data[0];
        
        clearInterval(playClipData.intervalId);
        playClipData.intervalId = undefined;
    }

    // module/private exports
    cornerstoneTools.playClip = playClip;
    cornerstoneTools.stopClip = stopClip;

})($, cornerstone, cornerstoneTools);
