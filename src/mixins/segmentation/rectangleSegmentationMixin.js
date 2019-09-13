import { draw, drawRect, getNewContext } from '../../drawing';
import external from '../../externalModules';
import _isEmptyObject from '../../util/isEmptyObject';
import { getModule } from '../../store';
import { getDiffBetweenPixelData } from '../../util/segmentation';

const { getters, setters } = getModule('segmentation');

/**
 * Render hook: draws the Scissors's outline, box, or circle
 *
 * @param {Object} evt Cornerstone.event#cornerstoneimagerendered > cornerstoneimagerendered event
 * @memberof Tools.ScissorsTool
 * @returns {void}
 */
function renderToolData(evt) {
  const eventData = evt.detail;
  const { element } = eventData;
  const color = getters.brushColor(element, true);
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
function _startOutliningRegion(evt) {
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
function _setHandlesAndUpdate(evt) {
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
function _applyStrategy(evt) {
  evt.detail.handles = this.handles;

  const { element } = evt.detail;

  const { labelmap2D, labelmap3D, currentImageIdIndex } = getters.labelmap2D(
    element
  );

  const pixelData = labelmap2D.pixelData;
  const previousPixeldata = pixelData.slice();

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

  const operationData = {
    points,
    pixelData,
    segmentIndex: labelmap3D.activeSegmentIndex,
    segmentationMixinType: `rectangleSegmentationMixin`,
  };

  this.applyActiveStrategy(evt, operationData);

  const operation = {
    imageIdIndex: currentImageIdIndex,
    diff: getDiffBetweenPixelData(previousPixeldata, pixelData),
  };

  setters.pushState(this.element, [operation]);

  // Invalidate the brush tool data so it is redrawn
  setters.updateSegmentsOnLabelmap2D(labelmap2D);
  external.cornerstone.updateImage(element);

  this._resetHandles();
}

/**
 * Sets the start and end handle points to empty objects
 *
 * @private
 * @method _resetHandles
 * @returns {void}
 */
function _resetHandles() {
  this.handles = {
    start: {},
    end: {},
  };
}

/**
 * @mixin rectangleSegmentationMixin - segmentation operations for rectangles
 * @memberof Mixins
 */
export default {
  postTouchStartCallback: _startOutliningRegion,
  postMouseDownCallback: _startOutliningRegion,
  mouseClickCallback: _startOutliningRegion,
  touchDragCallback: _setHandlesAndUpdate,
  mouseDragCallback: _setHandlesAndUpdate,
  mouseMoveCallback: _setHandlesAndUpdate,
  touchEndCallback: _applyStrategy,
  mouseUpCallback: _applyStrategy,
  initializeMixin: _resetHandles,
  renderToolData,
  _resetHandles,
  _applyStrategy,
};
