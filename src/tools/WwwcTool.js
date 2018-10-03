import external from './../externalModules.js';
import BaseTool from './../base/BaseTool.js';

export default class WwwcTool extends BaseTool {
  constructor (name = 'Wwwc') {
    const strategies = {
      basicLevelingStrategy
    };

    super({
      name,
      strategies,
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: {
        orientation: 0
      }
    });
  }

  mouseDragCallback (evt) {
    this.applyActiveStrategy(evt);
    external.cornerstone.setViewport(evt.detail.element, evt.detail.viewport);
  }

  touchDragCallback (evt) {
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
 * @param eventData
 */
function basicLevelingStrategy (evt, { orientation }) {
  const eventData = evt.detail;

  const maxVOI =
    eventData.image.maxPixelValue * eventData.image.slope +
    eventData.image.intercept;
  const minVOI =
    eventData.image.minPixelValue * eventData.image.slope +
    eventData.image.intercept;
  const imageDynamicRange = maxVOI - minVOI;
  const multiplier = imageDynamicRange / 1024;

  const deltaX = eventData.deltaPoints.page.x * multiplier;
  const deltaY = eventData.deltaPoints.page.y * multiplier;

  if (orientation === 0) {
    eventData.viewport.voi.windowWidth += deltaX;
    eventData.viewport.voi.windowCenter += deltaY;
  } else {
    eventData.viewport.voi.windowWidth += deltaY;
    eventData.viewport.voi.windowCenter += deltaX;
  }
}
