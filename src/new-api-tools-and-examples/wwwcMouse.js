/* eslint no-loop-func: 0 */ // --> OFF
import external from './../externalModules.js';
import baseMouseDragTool from './../base/baseMouseDragTool.js';

const cornerstone = external.cornerstone;

/**
 * Here we normalize the ww/wc adjustments so the same number of on screen pixels
 * adjusts the same percentage of the dynamic range of the image.  This is needed to
 * provide consistency for the ww/wc tool regardless of the dynamic range (e.g. an 8 bit
 * image will feel the same as a 16 bit image would)
 *
 * @param eventData
 */
function basicLevelingStrategy (evt) {
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

  eventData.viewport.voi.windowWidth += deltaX;
  eventData.viewport.voi.windowCenter += deltaY;
}

export default class extends baseMouseDragTool {
  constructor () {
    const strategies = {
      basicLevelingStrategy
    };

    super('wwwcMouse', strategies);
  }

  mouseDragCallback (evt) {
    console.log('wwwcMouse mouseDragCallback');

    this.applyActiveStrategy(evt);
    external.cornerstone.setViewport(evt.detail.element, evt.detail.viewport);
  }
}
