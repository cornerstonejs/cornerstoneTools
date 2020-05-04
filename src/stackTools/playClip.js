import EVENTS from '../events.js';
import external from '../externalModules.js';
import loadHandlerManager from '../stateManagement/loadHandlerManager.js';
import { addToolState, getToolState } from '../stateManagement/toolState.js';
import triggerEvent from '../util/triggerEvent.js';

const toolName = 'playClip';

/**
 * [private] Turns a Frame Time Vector (0018,1065) array into a normalized array of timeouts. Each element
 * ... of the resulting array represents the amount of time each frame will remain on the screen.
 * @param {Array} vector A Frame Time Vector (0018,1065) as specified in section C.7.6.5.1.2 of DICOM standard.
 * @param {Number} speed A speed factor which will be applied to each element of the resulting array.
 * @returns {Array} An array with timeouts for each animation frame.
 */
function getPlayClipTimeouts(vector, speed) {
  let i;
  let sample;
  let delay;
  let sum = 0;
  const limit = vector.length;
  const timeouts = [];

  // Initialize time varying to false
  timeouts.isTimeVarying = false;

  if (typeof speed !== 'number' || speed <= 0) {
    speed = 1;
  }

  // First element of a frame time vector must be discarded
  for (i = 1; i < limit; i++) {
    // eslint-disable-next-line no-bitwise
    delay = (Number(vector[i]) / speed) | 0; // Integral part only
    timeouts.push(delay);
    if (i === 1) {
      // Use first item as a sample for comparison
      sample = delay;
    } else if (delay !== sample) {
      timeouts.isTimeVarying = true;
    }

    sum += delay;
  }

  if (timeouts.length > 0) {
    if (timeouts.isTimeVarying) {
      // If it's a time varying vector, make the last item an average...
      // eslint-disable-next-line no-bitwise
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
 * @returns {void}
 */
function stopClipWithData(playClipData) {
  const id = playClipData.intervalId;

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
 * @param {HTMLElement} element
 * @returns {void}
 */
function triggerStopEvent(element) {
  const eventDetail = {
    element,
  };

  triggerEvent(element, EVENTS.CLIP_STOPPED, eventDetail);
}

/**
 * Starts playing a clip or adjusts the frame rate of an already playing clip.  framesPerSecond is
 * optional and defaults to 30 if not specified.  A negative framesPerSecond will play the clip in reverse.
 * The element must be a stack of images
 * @param {HTMLElement} element
 * @param {number} framesPerSecond
 * @returns {void}
 */
function playClip(element, framesPerSecond) {
  let playClipData;
  let playClipTimeouts;

  if (element === undefined) {
    throw new Error('playClip: element must not be undefined');
  }

  const stackToolData = getToolState(element, 'stack');

  if (!stackToolData || !stackToolData.data || !stackToolData.data.length) {
    return;
  }

  const cornerstone = external.cornerstone;
  // If we have more than one stack, check if we have a stack renderer defined
  let stackRenderer;

  if (stackToolData.data.length > 1) {
    const stackRendererData = getToolState(element, 'stackRenderer');

    if (
      stackRendererData &&
      stackRendererData.data &&
      stackRendererData.data.length
    ) {
      stackRenderer = stackRendererData.data[0];
    }
  }

  const stackData = stackToolData.data[0];

  const playClipToolData = getToolState(element, toolName);

  if (
    !playClipToolData ||
    !playClipToolData.data ||
    !playClipToolData.data.length
  ) {
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
      loop: true,
    };
    addToolState(element, toolName, playClipData);
  } else {
    playClipData = playClipToolData.data[0];
    // Make sure the specified clip is not running before any property update
    stopClipWithData(playClipData);
  }

  // If a framesPerSecond is specified and is valid, update the playClipData now
  if (framesPerSecond < 0 || framesPerSecond > 0) {
    playClipData.framesPerSecond = Number(framesPerSecond);
    playClipData.reverse = playClipData.framesPerSecond < 0;
    // If framesPerSecond is given, frameTimeVector will be ignored...
    playClipData.ignoreFrameTimeVector = true;
  }

  // Determine if frame time vector should be used instead of a fixed frame rate...
  if (
    playClipData.ignoreFrameTimeVector !== true &&
    playClipData.frameTimeVector &&
    playClipData.frameTimeVector.length === stackData.imageIds.length
  ) {
    playClipTimeouts = getPlayClipTimeouts(
      playClipData.frameTimeVector,
      playClipData.speed
    );
  }

  // This function encapsulates the frame rendering logic...
  const playClipAction = () => {
    // Hoisting of context variables
    let loader,
      startLoadingHandler,
      endLoadingHandler,
      errorLoadingHandler,
      newImageIdIndex = stackData.currentImageIdIndex;

    const imageCount = stackData.imageIds.length;

    if (playClipData.reverse) {
      newImageIdIndex--;
    } else {
      newImageIdIndex++;
    }

    if (
      !playClipData.loop &&
      (newImageIdIndex < 0 || newImageIdIndex >= imageCount)
    ) {
      stopClipWithData(playClipData);
      triggerStopEvent(element);

      return;
    }

    // Loop around if we go outside the stack
    if (newImageIdIndex >= imageCount) {
      newImageIdIndex = 0;
    }

    if (newImageIdIndex < 0) {
      newImageIdIndex = imageCount - 1;
    }

    if (newImageIdIndex !== stackData.currentImageIdIndex) {
      startLoadingHandler = loadHandlerManager.getStartLoadHandler(element);
      endLoadingHandler = loadHandlerManager.getEndLoadHandler(element);
      errorLoadingHandler = loadHandlerManager.getErrorLoadingHandler(element);

      if (startLoadingHandler) {
        startLoadingHandler(element);
      }

      if (stackData.preventCache === true) {
        loader = cornerstone.loadImage(stackData.imageIds[newImageIdIndex]);
      } else {
        loader = cornerstone.loadAndCacheImage(
          stackData.imageIds[newImageIdIndex]
        );
      }

      loader.then(
        function(image) {
          try {
            stackData.currentImageIdIndex = newImageIdIndex;
            if (stackRenderer) {
              stackRenderer.currentImageIdIndex = newImageIdIndex;
              stackRenderer.render(element, stackToolData.data);
            } else {
              cornerstone.displayImage(element, image);
            }
            if (endLoadingHandler) {
              endLoadingHandler(element, image);
            }
          } catch (error) {
            return;
          }
        },
        function(error) {
          const imageId = stackData.imageIds[newImageIdIndex];

          if (errorLoadingHandler) {
            errorLoadingHandler(element, imageId, error);
          }
        }
      );
    }
  };

  // If playClipTimeouts array is available, not empty and its elements are NOT uniform ...
  // ... (at least one timeout is different from the others), use alternate setTimeout implementation
  if (
    playClipTimeouts &&
    playClipTimeouts.length > 0 &&
    playClipTimeouts.isTimeVarying
  ) {
    playClipData.usingFrameTimeVector = true;
    playClipData.intervalId = setTimeout(function playClipTimeoutHandler() {
      playClipData.intervalId = setTimeout(
        playClipTimeoutHandler,
        playClipTimeouts[stackData.currentImageIdIndex]
      );
      playClipAction();
    }, 0);
  } else {
    // ... otherwise user setInterval implementation which is much more efficient.
    playClipData.usingFrameTimeVector = false;
    playClipData.intervalId = setInterval(
      playClipAction,
      1000 / Math.abs(playClipData.framesPerSecond)
    );
  }
}

/**
 * Stops an already playing clip.
 * @param {HTMLElement} element
 * @returns {void}
 */
function stopClip(element) {
  const playClipToolData = getToolState(element, toolName);

  if (
    !playClipToolData ||
    !playClipToolData.data ||
    !playClipToolData.data.length
  ) {
    return;
  }

  stopClipWithData(playClipToolData.data[0]);
}

export { playClip, stopClip };
