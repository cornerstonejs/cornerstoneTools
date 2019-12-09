import external from './../../externalModules.js';
import BaseBrushTool from './../base/BaseBrushTool.js';
import {
  getToolState,
  addToolState,
} from './../../stateManagement/toolState.js';
import toolColors from './../../stateManagement/toolColors.js';
import store from './../../store/index.js';
import brushUtils from './../../util/brush/index.js';
import triggerEvent from './../../util/triggerEvent.js';
import EVENTS from '../../events.js';
import { getNewContext, draw, drawArea } from '../../drawing/index.js';

const { drawBrushOnCanvas, getCircle } = brushUtils;

const brushModule = store.modules.brush;

/**
 * @public
 * @class SelectTool
 * @memberof Tools.Select
 * @classdesc Tool for drawing segmentations on an image.
 * @extends Tools.Base.BaseBrushTool
 */
export default class UnSelectTool extends BaseBrushTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'UnSelect',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: { alwaysEraseOnClick: false, borderColor: '#ff0000' },
    };

    super(props, defaultProps);
    this.startPoint = {};
    this.selectPoints = [];
    // this.renderToolData = renderToolData.bind(this);
    // this.touchDragCallback = this._paint.bind(this);
  }

  /**
   * Called by the event dispatcher to render the image.
   *
   * @param {Object} evt - The event.
   * @returns {void}
   */
  renderToolData(evt) {
    const eventData = evt.detail;
    const viewport = eventData.viewport;

    let mousePosition;

    if (this._drawing) {
      mousePosition = this._lastImageCoords;
    } else if (this._mouseUpRender) {
      mousePosition = this._lastImageCoords;
      this._mouseUpRender = false;
    } else {
      mousePosition = store.state.mousePositionImage;
    }

    if (!mousePosition) {
      return;
    }

    const { rows, columns } = eventData.image;
    const { x, y } = mousePosition;

    if (x < 0 || x > columns || y < 0 || y > rows) {
      return;
    }

    // Draw the hover overlay on top of the pixel data
    const radius = brushModule.state.radius;
    const context = getNewContext(eventData.segCanvasContext.canvas);
    const element = eventData.element;
    const drawId = brushModule.state.drawColorId;
    const color = this.configuration.borderColor;
    const fillColor = 'background';

    const options = !this.isSelecting ? { color, fillColor } : { color };
    if (!this.startPoint) {
      return
    }
    draw(context, context => { 
      drawArea(context, element, this.startPoint, this.selectPoints, options);
      context.globalCompositeOperation = 'destination-out';
    })
  }

  _begin(evt) {
    this.isSelecting = true;
    this.startPoint = evt.detail.currentPoints.image;
    this.selectPoints = [this.startPoint];
  }

  _continue(evt) {
    if (!this.isSelecting) {
      return;
    }
    this.isSelecting = true;
    this.selectPoints.push(evt.detail.currentPoints.image);
    this.isSelecting = true;
    this.selectPoints.push(evt.detail.currentPoints.image);
    const element = evt.detail.element;
    external.cornerstone.updateImage(element);
  }

  _end(evt) {
    this.isSelecting = false;
    this.selectPoints.push(this.startPoint);
    const element = evt.detail.element;
    external.cornerstone.updateImage(element);
  }
}