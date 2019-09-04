import external from '../../externalModules.js';
import { getModule } from '../../store';
import { getLogger } from '../../util/logger.js';
import { draw, drawJoinedLines, getNewContext } from '../../drawing';
import { getDiffBetweenPixelData } from '../../util/segmentation';

const logger = getLogger('tools:ScissorsTool');

const { getters, setters } = getModule('segmentation');

/**
 * Render hook: draws the FreehandScissors's outline
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
  const points = this.handles.points;

  if (points.length < 2) {
    return;
  }

  draw(context, context => {
    for (let j = 0; j < points.length; j++) {
      const lines = [...points[j].lines];

      if (j === points.length - 1) {
        // If it's still being actively drawn, keep the last line to
        // The mouse location
        lines.push(points[0]);
      }
      drawJoinedLines(context, element, points[j], lines, {
        color,
      });
    }
  });
}

/**
 * Sets the start handle point and claims the eventDispatcher event
 *
 * @private
 * @param {*} evt // mousedown, touchstart, click
 * @returns {void|null}
 */
function _startOutliningRegion(evt) {
  const element = evt.detail.element;
  const image = evt.detail.currentPoints.image;
  const points = this.handles.points;

  if (!points.length) {
    logger.warn('Something went wrong, empty handles detected.');

    return null;
  }

  points.push({
    x: image.x,
    y: image.y,
    lines: [],
  });

  this.currentHandle += 1;

  external.cornerstone.updateImage(element);
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
  const eventData = evt.detail;
  const element = evt.detail.element;

  this._addPoint(eventData);
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
  const points = this.handles.points;
  const { element } = evt.detail;

  const { labelmap2D, labelmap3D, currentImageIdIndex } = getters.labelmap2D(
    element
  );

  const pixelData = labelmap2D.pixelData;
  const previousPixeldata = pixelData.slice();

  const operationData = {
    points,
    pixelData,
    segmentIndex: labelmap3D.activeSegmentIndex,
    segmentationMixinType: `freehandSegmentationMixin`,
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
 * @returns {undefined}
 */
function _resetHandles() {
  this.handles = {
    points: [],
  };

  this.currentHandle = 0;
}

/**
 * Adds a point on mouse click in polygon mode.
 *
 * @private
 * @param {Object} evt - data object associated with an event.
 * @returns {void}
 */
function _addPoint(evt) {
  const points = this.handles.points;

  if (points.length) {
    // Add the line from the current handle to the new handle
    points[this.currentHandle - 1].lines.push({
      x: evt.currentPoints.image.x,
      y: evt.currentPoints.image.y,
      lines: [],
    });
  }

  // Add the new handle
  points.push({
    x: evt.currentPoints.image.x,
    y: evt.currentPoints.image.y,
    lines: [],
  });

  // Increment the current handle value
  this.currentHandle += 1;

  // Force onImageRendered to fire
  external.cornerstone.updateImage(evt.element);
}

/**
 * @mixin freehandSegmentationMixin - segmentation operations for freehand
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
  _addPoint,
  _applyStrategy,
};
