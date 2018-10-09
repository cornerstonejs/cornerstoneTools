import external from './../externalModules.js';
import BaseTool from './../base/BaseTool.js';
import { changeViewportScale } from './shared/zoom.js';

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
