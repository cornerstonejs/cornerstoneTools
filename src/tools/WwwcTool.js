import external from '../externalModules.js';
import BaseTool from './base/BaseTool.js';
import { wwwcCursor } from './cursors/index.js';

/**
 * @public
 * @class WwwcTool
 * @memberof Tools
 *
 * @classdesc Tool for setting wwwc by dragging with mouse/touch.
 * @extends Tools.Base.BaseTool
 */
export default class WwwcTool extends BaseTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'Wwwc',
      strategies: { basicLevelingStrategy },
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: {
        orientation: 0,
      },
      svgCursor: wwwcCursor,
    };

    super(props, defaultProps);
  }

  mouseDragCallback(evt) {
    this.applyActiveStrategy(evt);
    external.cornerstone.setViewport(evt.detail.element, evt.detail.viewport);
  }

  touchDragCallback(evt) {
    // Prevent CornerstoneToolsTouchStartActive from killing any press events
    evt.stopImmediatePropagation();
    this.applyActiveStrategy(evt);
    external.cornerstone.setViewport(evt.detail.element, evt.detail.viewport);
  }
}

/**
 * Here we normalize the ww/wc adjustments so the same number of on screen pixels
 * adjusts the same percentage of the dynamic range of the image.  This is needed to
 * provide consistency for the ww/wc tool regardless of the dynamic range (e.g. an 8 bit
 * image will feel the same as a 16 bit image would)
 *
 * @param {Object} evt
 * @param {Object} { orienttion }
 * @returns {void}
 */
function basicLevelingStrategy(evt, { orientation }) {
  const eventData = evt.detail;
  const deltaX = eventData.deltaPoints.page.x;
  const deltaY = eventData.deltaPoints.page.y;

  eventData.viewport.voi.windowWidth = formatWindowLevelValue(eventData.viewport.voi.windowWidth + deltaX);
  eventData.viewport.voi.windowCenter = formatWindowLevelValue(eventData.viewport.voi.windowCenter - deltaY);
}

const WindowLevelValue = {
  VALUE_MAX: 9999,
  VALUE_MIN: -9999,
};

const formatWindowLevelValue = function(val) {
  if (val > WindowLevelValue.VALUE_MAX) {
    return WindowLevelValue.VALUE_MAX;
  }

  if (val < WindowLevelValue.VALUE_MIN) {
    return WindowLevelValue.VALUE_MIN;
  }
  return val;
};
  