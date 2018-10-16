import external from './../externalModules.js';
import BaseTool from './../base/BaseTool.js';
import zoomUtils from '../util/zoom/index.js';

const { changeViewportScale } = zoomUtils;

/**
 * @export @public @class
 * @name ZoomMouseWheelTool
 * @classdesc Tool for changing magnification with the mouse wheel.
 * @extends BaseTool
 */
export default class ZoomMouseWheelTool extends BaseTool {
  constructor (name = 'ZoomMouseWheel') {
    super({
      name,
      supportedInteractionTypes: ['MouseWheel'],
      configuration: {
        minScale: 0.25,
        maxScale: 20.0
      }
    });
  }

  /**
   *
   *
   * @param {*} evt
   */
  mouseWheelCallback (evt) {
    const { element, viewport, direction } = evt.detail;
    const { invert, maxScale, minScale } = this.configuration;
    const ticks = invert ? direction / 4 : -direction / 4;
    const updatedViewport = changeViewportScale(viewport, ticks, {
      maxScale,
      minScale
    });

    external.cornerstone.setViewport(element, updatedViewport);
  }
}
