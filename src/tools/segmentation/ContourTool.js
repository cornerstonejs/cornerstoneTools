import debounce from 'lodash/debounce';
import external from './../../externalModules.js';
import { BaseBrushTool } from '../base';
import { getModule } from './../../store/index.js';
import { drawBrushPixels, getCircle } from '../../util/segmentation/index.js';
import { getLogger } from '../../util/logger.js';

const logger = getLogger('tools:BrushTool');

let cache = {};
let nextRemove = null;
/**
 * @public
 * @class BrushTool
 * @memberof Tools.Brush
 * @classdesc Tool for drawing segmentations on an image.
 * @extends Tools.Base.BaseBrushTool
 */
export default class Contour extends BaseBrushTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'Contour',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: {},
      mixins: ['renderBrushMixin'],
    };

    super(props, defaultProps);

    this.pixelsArray = [];
    this.sendToServer = debounce(() => {
      // console.log('Sending points array to server', this.pixelsArray);
      if (this.pixelsArray.length === 0) return;
      const copy = this.pixelsArray;
      this.pixelsArray = [];

      // Do some cleaning
      drawBrushPixels(
        copy.map(a => [a[0][0], a[0][1]]),
        cache.pixelData,
        cache.activeSegmentIndex,
        cache.columns,
        true
      );

      if (nextRemove) {
        drawBrushPixels(
          nextRemove,
          cache.pixelData,
          cache.activeSegmentIndex,
          cache.columns,
          true
        );
      }

      nextRemove = copy.map(a => [a[0][0] + 10, a[0][1] - 20]);
      const pixelsToDraw = copy.map(a => [a[0][0] + 10, a[0][1] - 20]);

      // Do some drawing
      drawBrushPixels(
        pixelsToDraw,
        cache.pixelData,
        cache.activeSegmentIndex,
        cache.columns
      );

      external.cornerstone.updateImage(cache.evt.detail.element);
    }, 1000);
    this.touchDragCallback = this._paint.bind(this);

    setTimeout(this._doStaff, 3000);
  }

  /**
   * Paints the data to the labelmap.
   *
   * @protected
   * @param  {Object} evt The data object associated with the event.
   * @returns {void}
   */
  _paint(evt) {
    const eventData = evt.detail;
    const element = eventData.element;
    const { rows, columns } = eventData.image;
    const { x, y } = eventData.currentPoints.image;

    // this.pixelsArray.push({ x, y });
    // console.log(`[x, y]: [${x}, ${y}]`);
    this.sendToServer();

    if (x < 0 || x > columns || y < 0 || y > rows) {
      return;
    }

    const radius = 1;
    const pointerArray = getCircle(radius, rows, columns, x, y);
    // console.log(pointerArray)
    this.pixelsArray.push(pointerArray);

    const { labelmap2D, labelmap3D, shouldErase } = this.paintEventData;

    cache.pixelData = labelmap2D.pixelData;
    cache.activeSegmentIndex = labelmap3D.activeSegmentIndex;
    cache.columns = columns;
    console.log(shouldErase);

    // Draw / Erase the active color.
    drawBrushPixels(
      pointerArray,
      labelmap2D.pixelData,
      labelmap3D.activeSegmentIndex,
      columns,
      shouldErase
    );

    cache.evt = evt;

    external.cornerstone.updateImage(evt.detail.element);
  }
}
