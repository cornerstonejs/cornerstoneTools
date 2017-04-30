import { addToolState, getToolState } from '../stateManagement/toolState';
import incrementTimePoint from './incrementTimePoint';

const toolType = 'timeSeriesPlayer';

/**
 * Starts playing a clip of different time series of the same image or adjusts the frame rate of an
 * already playing clip. framesPerSecond is optional and defaults to 30 if not specified. A negative
 * framesPerSecond will play the clip in reverse.
 * The element must have time series
 * @param element
 * @param framesPerSecond
 */
function playClip (element, framesPerSecond) {
  if (element === undefined) {
    throw new Error('playClip: element must not be undefined');
  }

  if (framesPerSecond === undefined) {
    framesPerSecond = 30;
  }

  const timeSeriesToolData = getToolState(element, 'timeSeries');

  if (timeSeriesToolData === undefined || timeSeriesToolData.data === undefined || timeSeriesToolData.data.length === 0) {
    return;
  }

  const playClipToolData = getToolState(element, toolType);
  let playClipData;

  if (playClipToolData === undefined || playClipToolData.data.length === 0) {
    playClipData = {
      intervalId: undefined,
      framesPerSecond,
      lastFrameTimeStamp: undefined,
      frameRate: 0
    };
    addToolState(element, toolType, playClipData);
  } else {
    playClipData = playClipToolData.data[0];
    playClipData.framesPerSecond = framesPerSecond;
  }

    // If already playing, do not set a new interval
  if (playClipData.intervalId !== undefined) {
    return;
  }

  playClipData.intervalId = setInterval(function () {
    if (playClipData.framesPerSecond > 0) {
      incrementTimePoint(element, 1, true);
    } else {
      incrementTimePoint(element, -1, true);
    }
  }, 1000 / Math.abs(playClipData.framesPerSecond));
}

/**
 * Stops an already playing clip.
 * * @param element
 */
function stopClip (element) {
  const playClipToolData = getToolState(element, toolType);

  if (!playClipToolData || !playClipToolData.data || !playClipToolData.data.length) {
    return;
  }
  const playClipData = playClipToolData.data[0];


  clearInterval(playClipData.intervalId);
  playClipData.intervalId = undefined;
}

// Module/private exports
const timeSeriesPlayer = {
  start: playClip,
  stop: stopClip
};

export default timeSeriesPlayer;
