(function($, cornerstone, cornerstoneTools) {

    'use strict';

    var toolType = 'playClip';

    /**
     * [private] Turns a Frame Time Vector (0018,1065) array into a normalized array of timeouts. Each element
     * ... of the resulting array represents the amount of time each frame will remain on the screen.
     * @param {Array} vector A Frame Time Vector (0018,1065) as specified in section C.7.6.5.1.2 of DICOM standard.
     * @param {Number} speed A speed factor which will be applied to each element of the resulting array.
     * @return {Array} An array with timeouts for each animation frame.
     */
    function getPlayClipTimeouts(vector, speed) {

        var i,
            sample,
            delay,
            sum = 0,
            limit = vector.length,
            timeouts = [];

        // initialize time varying to false
        timeouts.isTimeVarying = false;

        if (typeof speed !== 'number' || speed <= 0) {
            speed = 1;
        }

        // first element of a frame time vector must be discarded
        for (i = 1; i < limit; i++) {
            delay = (+vector[i] / speed) | 0; // integral part only
            timeouts.push(delay);
            if (i === 1) { // use first item as a sample for comparison
                sample = delay;
            } else if (delay !== sample) {
                timeouts.isTimeVarying = true;
            }

            sum += delay;
        }

        if (timeouts.length > 0) {
            if (timeouts.isTimeVarying) {
                // if it's a time varying vector, make the last item an average...
                delay = (sum / timeouts.length) | 0;
            } else {
                delay = timeouts[0];
            }

            timeouts.push(delay);
        }

        return timeouts;

    }

    /**
     * [private] Performs the heavy lifting of stopping an ongoing animation.
     * @param {Object} playClipData The data from playClip that needs to be stopped.
     * @return void
     */
    function stopClipWithData(playClipData) {
        var id = playClipData.intervalId;
        if (typeof id !== 'undefined') {
            playClipData.intervalId = undefined;
            if (playClipData.usingFrameTimeVector) {
                clearTimeout(id);
            } else {
                clearInterval(id);
            }
        }
    }

    /**
     * [private] Trigger playClip tool stop event.
     * @param element
     * @return void
     */
    function triggerStopEvent(element) {
        var event,
            eventDetail = {
                element: element
            };
        event = $.Event('CornerstoneToolsClipStopped', eventDetail);
        $(element).trigger(event, eventDetail);
    }

    /**
     * Starts playing a clip or adjusts the frame rate of an already playing clip.  framesPerSecond is
     * optional and defaults to 30 if not specified.  A negative framesPerSecond will play the clip in reverse.
     * The element must be a stack of images
     * @param element
     * @param framesPerSecond
     */
    function playClip(element, framesPerSecond) {

        // hoisting of context variables
        var stackToolData,
            stackData,
            playClipToolData,
            playClipData,
            playClipTimeouts,
            playClipAction;

        if (element === undefined) {
            throw 'playClip: element must not be undefined';
        }

        stackToolData = cornerstoneTools.getToolState(element, 'stack');
        if (!stackToolData || !stackToolData.data || !stackToolData.data.length) {
            return;
        }

        stackData = stackToolData.data[0];

        playClipToolData = cornerstoneTools.getToolState(element, toolType);
        if (!playClipToolData || !playClipToolData.data || !playClipToolData.data.length) {
            playClipData = {
                intervalId: undefined,
                framesPerSecond: 30,
                lastFrameTimeStamp: undefined,
                frameRate: 0,
                frameTimeVector: undefined,
                ignoreFrameTimeVector: false,
                usingFrameTimeVector: false,
                speed: 1,
                reverse: false,
                loop: true
            };
            cornerstoneTools.addToolState(element, toolType, playClipData);
        } else {
            playClipData = playClipToolData.data[0];
            // make sure the specified clip is not running before any property update
            stopClipWithData(playClipData);
        }

        // If a framesPerSecond is specified and is valid, update the playClipData now
        if (framesPerSecond < 0 || framesPerSecond > 0) {
            playClipData.framesPerSecond = +framesPerSecond;
            playClipData.reverse = playClipData.framesPerSecond < 0;
            // if framesPerSecond is given, frameTimeVector will be ignored...
            playClipData.ignoreFrameTimeVector = true;
        }

        // determine if frame time vector should be used instead of a fixed frame rate...
        if (
            playClipData.ignoreFrameTimeVector !== true &&
            playClipData.frameTimeVector &&
            playClipData.frameTimeVector.length === stackData.imageIds.length
        ) {
            playClipTimeouts = getPlayClipTimeouts(playClipData.frameTimeVector, playClipData.speed);
        }

        // this function encapsulates the frame rendering logic...
        playClipAction = function playClipAction() {

            // hoisting of context variables
            var loader,
                viewport,
                startLoadingHandler,
                endLoadingHandler,
                errorLoadingHandler,
                newImageIdIndex = stackData.currentImageIdIndex,
                imageCount = stackData.imageIds.length;

            if (playClipData.reverse) {
                newImageIdIndex--;
            } else {
                newImageIdIndex++;
            }

            if (!playClipData.loop && (newImageIdIndex < 0 || newImageIdIndex >= imageCount)) {
                stopClipWithData(playClipData);
                triggerStopEvent(element);
                return;
            }

            // loop around if we go outside the stack
            if (newImageIdIndex >= imageCount) {
                newImageIdIndex = 0;
            }

            if (newImageIdIndex < 0) {
                newImageIdIndex = imageCount - 1;
            }

            if (newImageIdIndex !== stackData.currentImageIdIndex) {

                startLoadingHandler = cornerstoneTools.loadHandlerManager.getStartLoadHandler();
                endLoadingHandler = cornerstoneTools.loadHandlerManager.getEndLoadHandler();
                errorLoadingHandler = cornerstoneTools.loadHandlerManager.getErrorLoadingHandler();

                if (startLoadingHandler) {
                    startLoadingHandler(element);
                }

                viewport = cornerstone.getViewport(element);

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

        };

        // if playClipTimeouts array is available, not empty and its elements are NOT uniform ...
        // ... (at least one timeout is different from the others), use alternate setTimeout implementation
        if (playClipTimeouts && playClipTimeouts.length > 0 && playClipTimeouts.isTimeVarying) {
            playClipData.usingFrameTimeVector = true;
            playClipData.intervalId = setTimeout(function playClipTimeoutHandler() {
                playClipData.intervalId = setTimeout(playClipTimeoutHandler, playClipTimeouts[stackData.currentImageIdIndex]);
                playClipAction();
            }, 0);
        } else {
            // ... otherwise user setInterval implementation which is much more efficient.
            playClipData.usingFrameTimeVector = false;
            playClipData.intervalId = setInterval(playClipAction, 1000 / Math.abs(playClipData.framesPerSecond));
        }

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

        stopClipWithData(playClipToolData.data[0]);

    }

    // module/private exports
    cornerstoneTools.playClip = playClip;
    cornerstoneTools.stopClip = stopClip;

})($, cornerstone, cornerstoneTools);
