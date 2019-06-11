import external from './../../externalModules.js';
import BaseBrushTool from './../base/BaseBrushTool.js';
import store from './../../store/index.js';
import brushUtils from './../../util/brush/index.js';
import triggerEvent from './../../util/triggerEvent.js';
import EVENTS from '../../events.js';
import { getLogger } from '../../util/logger.js';

const logger = getLogger('tools:BrushTool');

const { drawBrushPixels, getCircle } = brushUtils;

const brushModule = store.modules.brush;

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
    };

    super(props, defaultProps);

    logger.warn(this);

    this.touchDragCallback = this._paint.bind(this);
  }

  /**
   * Called by the event dispatcher to render the image.
   *
   * @param {Object} evt - The event.
   * @returns {void}
   */
  renderBrush(evt) {
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
    const context = eventData.canvasContext;
    const element = eventData.element;
    const color = brushModule.getters.brushColor(element, this._drawing);

    context.setTransform(1, 0, 0, 1, 0, 0);

    const { cornerstone } = external;

    const circleRadius = radius * viewport.scale;
    const mouseCoordsCanvas = cornerstone.pixelToCanvas(element, mousePosition);

    context.beginPath();
    context.strokeStyle = color;
    context.ellipse(
      mouseCoordsCanvas.x,
      mouseCoordsCanvas.y,
      circleRadius,
      circleRadius,
      0,
      0,
      2 * Math.PI
    );
    context.stroke();
  }

  /**
   * Paints the data to the canvas.
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

    if (x < 0 || x > columns || y < 0 || y > rows) {
      return;
    }

    const radius = brushModule.state.radius;
    const pointerArray = getCircle(radius, rows, columns, x, y);

    const {
      labelmap3D,
      currentImageIdIndex,
      activeLabelmapIndex,
      shouldErase,
    } = this.paintEventData;

    // Draw / Erase the active color.
    drawBrushPixels(
      pointerArray,
      labelmap3D,
      currentImageIdIndex,
      labelmap3D.activeDrawColorId,
      columns,
      shouldErase
    );

    external.cornerstone.triggerEvent(element, EVENTS.LABELMAP_MODIFIED, {
      activeLabelmapIndex,
    });

    external.cornerstone.updateImage(evt.detail.element);
  }
}

function _getBaseBrushToolStateForElement(element) {
  let toolState = getToolState(
    element,
    BaseBrushTool.getReferencedToolDataName()
  );

  if (!toolState) {
    addToolState(element, BaseBrushTool.getReferencedToolDataName(), {});
    toolState = getToolState(
      element,
      BaseBrushTool.getReferencedToolDataName()
    );
  }

  return toolState;
}

function _isSegmentationVisibleForElement(
  element,
  segmentationIndex,
  toolData
) {
  const enabledElement = external.cornerstone.getEnabledElement(element);
  const visibleSegmentationsForElement = brushModule.getters.visibleSegmentationsForElement(
    enabledElement.uuid
  );

  return (
    // Global alpha for active segmentation
    brushModule.state.alpha > 0.001 &&
    // Master isVisible toggle per seg + element
    // TODO: If false, should we check the secondary alpha that's applied to segmentions that aren't visible?
    visibleSegmentationsForElement[segmentationIndex] === true &&
    // Does not have alpha, or alpha is > 1 (0 to 255)
    (toolData[segmentationIndex] === undefined ||
      toolData[segmentationIndex].alpha === undefined ||
      toolData[segmentationIndex].alpha > 0.001)
  );
}
