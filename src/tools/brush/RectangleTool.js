import BaseTool from '../base/BaseTool';
import toolColors from '../../stateManagement/toolColors';
import { draw, drawRect, getNewContext } from '../../drawing';
import {
  fillInsideBoundingBox,
  fillOutsideBoundingBox,
} from './utils/Operations';
import external from '../../externalModules';
import _isEmptyObject from './../../util/isEmptyObject';
import { setToolCursor } from '../../store/setToolCursor';
import store from '../../store';

// Cursors
import {
  scissorsRectangleEraseInsideCursor,
  scissorsRectangleEraseOutsideCursor,
  scissorsRectangleFillInsideCursor,
  scissorsRectangleFillOutsideCursor,
} from '../cursors';
import { getBoundingBoxAroundPolygon } from './utils/Boundaries';

const brushModule = store.modules.brush;
const { getters } = brushModule;

/**
 * @public
 * @class RectangleTool
 * @memberof Tools
 * @classdesc Tool for slicing brush pixel data within a rectangle shape
 * @extends Tools.Base.BaseTool
 */
export default class RectangleTool extends BaseTool {
  /** @inheritdoc */
  constructor(props = {}) {
    const defaultProps = {
      name: 'Rectangle',
      configuration: {
        referencedToolData: 'brush',
      },
      strategies: {
        FILL_INSIDE: _fillInsideStrategy,
        FILL_OUTSIDE: _fillOutsideStrategy,
        ERASE_OUTSIDE: _eraseOutsideStrategy,
        ERASE_INSIDE: _eraseInsideStrategy,
        default: _fillOutsideStrategy,
      },
      defaultStrategy: 'default',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      svgCursor: scissorsRectangleFillInsideCursor,
    };

    super(props, defaultProps);
    this._resetHandles();

    //
    // Touch
    //
    /** @inheritdoc */
    this.postTouchStartCallback = this._startOutliningRegion.bind(this);

    /** @inheritdoc */
    this.touchDragCallback = this._setHandlesAndUpdate.bind(this);

    /** @inheritdoc */
    this.touchEndCallback = this._applyStrategy.bind(this);

    //
    // MOUSE
    //
    /** @inheritdoc */
    this.postMouseDownCallback = this._startOutliningRegion.bind(this);

    /** @inheritdoc */
    this.mouseClickCallback = this._startOutliningRegion.bind(this);

    /** @inheritdoc */
    this.mouseDragCallback = this._setHandlesAndUpdate.bind(this);

    /** @inheritdoc */
    this.mouseMoveCallback = this._setHandlesAndUpdate.bind(this);

    /** @inheritdoc */
    this.mouseUpCallback = this._applyStrategy.bind(this);
  }

  /**
   * Render hook: draws the Scissors's outline, box, or circle
   *
   * @param {Object} evt Cornerstone.event#cornerstoneimagerendered > cornerstoneimagerendered event
   * @memberof Tools.ScissorsTool
   * @returns {void}
   */
  renderToolData(evt) {
    const eventData = evt.detail;
    const { element } = eventData;
    const color = toolColors.getColorIfActive({ active: true });
    const context = getNewContext(eventData.canvasContext.canvas);

    draw(context, context => {
      drawRect(context, element, this.handles.start, this.handles.end, {
        color,
      });
    });
  }

  /**
   * Sets the start handle point and claims the eventDispatcher event
   *
   * @private
   * @param {*} evt // mousedown, touchstart, click
   * @returns {Boolean} True
   */
  _startOutliningRegion(evt) {
    const consumeEvent = true;
    const element = evt.detail.element;
    const image = evt.detail.currentPoints.image;

    if (_isEmptyObject(this.handles.start)) {
      this.handles.start = image;
    } else {
      this.handles.end = image;
      this._applyStrategy(evt);
    }

    external.cornerstone.updateImage(element);

    return consumeEvent;
  }

  /**
   * This function will update the handles and updateImage to force re-draw
   *
   * @private
   * @method _setHandlesAndUpdate
   * @param {(CornerstoneTools.event#TOUCH_DRAG|CornerstoneTools.event#MOUSE_DRAG|CornerstoneTools.event#MOUSE_MOVE)} evt  Interaction event emitted by an enabledElement
   * @returns {void}
   */
  _setHandlesAndUpdate(evt) {
    const {
      element,
      currentPoints: { image },
    } = evt.detail;

    this.handles.end = image;
    external.cornerstone.updateImage(element);
  }

  /**
   * Event handler for MOUSE_UP/TOUCH_END during handle drag event loop.
   *
   * @private
   * @method _applyStrategy
   * @param {(CornerstoneTools.event#MOUSE_UP|CornerstoneTools.event#TOUCH_END)} evt Interaction event emitted by an enabledElement
   * @returns {void}
   */
  _applyStrategy(evt) {
    evt.detail.handles = this.handles;
    this._applySegmentationChanges(evt);
    this._resetHandles();
  }

  /**
   * Sets the start and end handle points to empty objects
   *
   * @private
   * @method _resetHandles
   * @returns {undefined}
   */
  _resetHandles() {
    this.handles = {
      start: {},
      end: {},
    };
  }

  /**
   * Function responsible for changing the Cursor, according to the strategy
   * @param {HTMLElement} element
   * @param {string} strategy The strategy to be used on Tool
   * @private
   * @returns {void}
   */
  _changeCursor(element, strategy) {
    // Necessary to avoid setToolCursor without elements, what throws an error
    if (!this.element) {
      return;
    }

    const cursorList = {
      FILL_INSIDE: scissorsRectangleFillInsideCursor,
      FILL_OUTSIDE: scissorsRectangleFillOutsideCursor,
      ERASE_OUTSIDE: scissorsRectangleEraseOutsideCursor,
      ERASE_INSIDE: scissorsRectangleEraseInsideCursor,
      default: scissorsRectangleFillInsideCursor,
    };

    const newCursor = cursorList[strategy] || cursorList.default;

    setToolCursor(element, newCursor);
    external.cornerstone.updateImage(element);
  }

  /**
   * Change Strategy Method
   * @param { string } strategy
   * @private
   * @returns {void}
   */
  _changeStrategy(strategy = 'default') {
    this.activeStrategy = strategy;
    this._changeCursor(this.element, strategy);
    this._resetHandles();
  }

  _applySegmentationChanges(evt) {
    const points = [
      {
        x: this.handles.start.x,
        y: this.handles.start.y,
      },
      {
        x: this.handles.end.x,
        y: this.handles.end.y,
      },
    ];
    const { image, element } = evt.detail;

    const {
      labelmap3D,
      currentImageIdIndex,
      activeLabelmapIndex,
    } = getters.getAndCacheLabelmap2D(element);

    const toolData = getters.labelmapBuffers(element, activeLabelmapIndex);

    const arrayLength = image.width * image.height * 2;
    const segmentationData = new Uint16Array(toolData.buffer, 0, arrayLength);

    evt.detail.handles = this.handles;
    evt.OperationData = {
      points,
      segmentationData,
      image,
    };

    this.applyActiveStrategy(evt);

    // TODO: Future: 3D propagation (unlimited, positive, negative, symmetric)

    // Invalidate the brush tool data so it is redrawn
    labelmap3D.labelmaps2D[currentImageIdIndex].invalidated = true;
    external.cornerstone.updateImage(element);
  }
}

function _fillInsideStrategy(evt) {
  const { points, segmentationData, image } = evt.OperationData;

  fillInsideBoundingBox(points, segmentationData, image, 1);
}

function _fillOutsideStrategy(evt) {
  const { points, segmentationData, image } = evt.OperationData;
  const vertices = points.map(a => [a.x, a.y]);
  const [topLeft, bottomRight] = getBoundingBoxAroundPolygon(vertices, image);

  fillOutsideBoundingBox(topLeft, bottomRight, segmentationData, image, 1);
}

function _eraseOutsideStrategy(evt) {
  const { points, segmentationData, image } = evt.OperationData;
  const vertices = points.map(a => [a.x, a.y]);
  const [topLeft, bottomRight] = getBoundingBoxAroundPolygon(vertices, image);

  fillOutsideBoundingBox(topLeft, bottomRight, segmentationData, image, 0);
}

function _eraseInsideStrategy(evt) {
  const { points, segmentationData, image } = evt.OperationData;

  fillInsideBoundingBox(points, segmentationData, image, 0);
}
