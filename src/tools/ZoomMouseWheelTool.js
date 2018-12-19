import external from './../externalModules.js';
import BaseTool from './base/BaseTool.js';
import { changeViewportScale } from '../util/zoom/index.js';

/**
 * @public
 * @class ZoomMouseWheelTool
 * @memberof Tools
 *
 * @classdesc Tool for changing magnification with the mouse wheel.
 * @extends Tools.Base.BaseTool
 */
export default class ZoomMouseWheelTool extends BaseTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'ZoomMouseWheel',
      supportedInteractionTypes: ['MouseWheel'],
      configuration: {
        minScale: 0.25,
        maxScale: 20.0,
        invert: false,
      },
    };

    super(props, defaultProps);
  }

  mouseWheelCallback(evt) {
    const { element, viewport, spinY } = evt.detail;
    const { invert, maxScale, minScale } = this.configuration;
    const ticks = invert ? spinY / 4 : -spinY / 4;

    const updatedViewport = changeViewportScale(viewport, ticks, {
      maxScale,
      minScale,
    });

    external.cornerstone.setViewport(element, updatedViewport);
  }
}
