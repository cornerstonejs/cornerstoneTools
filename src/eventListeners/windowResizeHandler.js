import { state } from './../store/index.js';
import external from './../externalModules.js';

const enable = function () {
  window.addEventListener('resize', resizeThrottler, false);
};

const disable = function () {
  window.addEventListener('resize', resizeThrottler, false);
};

let resizeTimeout;

function resizeThrottler () {
  // Ignore resize events as long as an actualResizeHandler execution is in the queue
  if (!resizeTimeout) {
    resizeTimeout = setTimeout(function () {
      resizeTimeout = null;
      actualResizeHandler();

      // The actualResizeHandler will execute at a rate of 15fps
    }, 66);
  }
}

function actualResizeHandler () {
  state.enabledElements.forEach((element) => {
    external.cornerstone.resize(element);
  });
}

export default {
  enable,
  disable
};
