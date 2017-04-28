var toolType = 'timeSeriesPlayer';

/**
 * Starts playing a clip of different time series of the same image or adjusts the frame rate of an
 * already playing clip. framesPerSecond is optional and defaults to 30 if not specified. A negative
 * framesPerSecond will play the clip in reverse.
 * The element must have time series
 * @param element
 * @param framesPerSecond
 */
function playClip(element, framesPerSecond) {
    if (element === undefined) {
        throw 'playClip: element must not be undefined';
    }

    if (framesPerSecond === undefined) {
        framesPerSecond = 30;
    }

    var timeSeriesToolData = cornerstoneTools.getToolState(element, 'timeSeries');
    if (timeSeriesToolData === undefined || timeSeriesToolData.data === undefined || timeSeriesToolData.data.length === 0) {
        return;
    }

    var playClipToolData = cornerstoneTools.getToolState(element, toolType);
    var playClipData;
    if (playClipToolData === undefined || playClipToolData.data.length === 0) {
        playClipData = {
            intervalId: undefined,
            framesPerSecond: framesPerSecond,
            lastFrameTimeStamp: undefined,
            frameRate: 0
        };
        cornerstoneTools.addToolState(element, toolType, playClipData);
    } else {
        playClipData = playClipToolData.data[0];
        playClipData.framesPerSecond = framesPerSecond;
    }

    // if already playing, do not set a new interval
    if (playClipData.intervalId !== undefined) {
        return;
    }

    playClipData.intervalId = setInterval(function() {
        if (playClipData.framesPerSecond > 0) {
            cornerstoneTools.incrementTimePoint(element, 1, true);
        } else {
            cornerstoneTools.incrementTimePoint(element, -1, true);
        }
    }, 1000 / Math.abs(playClipData.framesPerSecond));
}

/**
 * Stops an already playing clip.
 * * @param element
 */
function stopClip(element) {
    var playClipToolData = cornerstoneTools.getToolState(element, toolType);
    var playClipData;
    if (playClipToolData === undefined || playClipToolData.data.length === 0) {
        return;
    } else {
        playClipData = playClipToolData.data[0];
    }

    clearInterval(playClipData.intervalId);
    playClipData.intervalId = undefined;
}

// module/private exports
const timeSeriesPlayer = {
    start: playClip,
    stop: stopClip
};

export default timeSeriesPlayer;