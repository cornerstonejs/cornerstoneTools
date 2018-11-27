const useHasFeature =
  document.implementation &&
  document.implementation.hasFeature &&
  document.implementation.hasFeature('', '') !== true;

// Reasonable defaults
const PIXEL_STEP = 10;
const LINE_HEIGHT = 40;
const PAGE_HEIGHT = 800;

/**
 * As of today, there are 2 DOM event types you can listen to:
 *
 *   'wheel'                -- Chrome(31+), FF(17+), IE(9+)
 *   'mousewheel'           -- Chrome, IE(6+), Opera, Safari
 *
 * So what to do?  The is the best:
 *
 *   normalizeWheel.getEventType();
 */
const normalizeWheel = function(event) {
  let sX = 0,
    sY = 0, // SpinX, spinY
    pX = 0,
    pY = 0; // PixelX, pixelY

  // Legacy
  if ('detail' in event) {
    sY = event.detail;
  }
  if ('wheelDelta' in event) {
    sY = -event.wheelDelta / 120;
  }
  if ('wheelDeltaY' in event) {
    sY = -event.wheelDeltaY / 120;
  }
  if ('wheelDeltaX' in event) {
    sX = -event.wheelDeltaX / 120;
  }

  // Side scrolling on FF with DOMMouseScroll
  if ('axis' in event && event.axis === event.HORIZONTAL_AXIS) {
    sX = sY;
    sY = 0;
  }

  pX = sX * PIXEL_STEP;
  pY = sY * PIXEL_STEP;

  if ('deltaY' in event) {
    pY = event.deltaY;
  }
  if ('deltaX' in event) {
    pX = event.deltaX;
  }

  if ((pX || pY) && event.deltaMode) {
    if (event.deltaMode === 1) {
      // Delta in LINE units
      pX *= LINE_HEIGHT;
      pY *= LINE_HEIGHT;
    } else {
      // Delta in PAGE units
      pX *= PAGE_HEIGHT;
      pY *= PAGE_HEIGHT;
    }
  }

  // Fall-back if spin cannot be determined
  if (pX && !sX) {
    sX = pX < 1 ? -1 : 1;
  }
  if (pY && !sY) {
    sY = pY < 1 ? -1 : 1;
  }

  return {
    spinX: sX,
    spinY: sY,
    pixelX: pX,
    pixelY: pY,
  };
};

const getEventType = function() {
  return _isWheelEventSupported() ? 'wheel' : 'mousewheel';
};

export default {
  normalizeWheel,
  getEventType,
};

/**
 * Checks if the weheel event is supported
 *
 * @private
 * @returns {boolean} True if the event is supported.
 * @license Modernizr 3.0.0pre (Custom Build) | MIT
 */
function _isWheelEventSupported() {
  const eventName = 'onwheel';
  let isSupported = eventName in document;

  // 2nd Check
  if (!isSupported) {
    const element = document.createElement('div');

    element.setAttribute(eventName, 'return;');
    isSupported = typeof element[eventName] === 'function';
  }

  // 3rd check
  if (!isSupported && useHasFeature) {
    isSupported = document.implementation.hasFeature('Events.wheel', '3.0');
  }

  return isSupported;
}
