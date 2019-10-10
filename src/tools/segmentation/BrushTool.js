import external from './../../externalModules.js';
import { BaseBrushTool } from '../base';
import { getModule } from './../../store/index.js';
import { drawBrushPixels, getCircle } from '../../util/segmentation/index.js';
import { getLogger } from '../../util/logger.js';

const logger = getLogger('tools:BrushTool');

const segmentationModule = getModule('segmentation');

/**
 * @public
 * @class BrushTool
 * @memberof Tools.Brush
 * @classdesc Tool for drawing segmentations on an image.
 * @extends Tools.Base.BaseBrushTool
 */
export default class BrushTool extends BaseBrushTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'Brush',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: {},
      mixins: ['renderBrushMixin'],
    };

    super(props, defaultProps);

    this.touchDragCallback = this._paint.bind(this);
  }

  /**
   * Paints the data to the labelmap.
   *
   * @protected
   * @param  {Object} evt The data object associated with the event.
   * @returns {void}
   */
  _paint(evt) {
    const { configuration } = segmentationModule;
    const eventData = evt.detail;
    const element = eventData.element;
    const { rows, columns } = eventData.image;
    const { x, y } = eventData.currentPoints.image;

    if (x < 0 || x > columns || y < 0 || y > rows) {
      return;
    }

    const radius = configuration.radius;
    const pointerArray = getCircle(radius, rows, columns, x, y);

    const { labelmap2D, labelmap3D, shouldErase } = this.paintEventData;

    // Draw / Erase the active color.
    drawBrushPixels(
      pointerArray,
      labelmap2D.pixelData,
      labelmap3D.activeSegmentIndex,
      columns,
      shouldErase
    );

    external.cornerstone.updateImage(evt.detail.element);
  }
}
