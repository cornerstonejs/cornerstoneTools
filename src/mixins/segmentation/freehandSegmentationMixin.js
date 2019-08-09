import external from '../../externalModules.js';
import store from '../../store';
import { getLogger } from '../../util/logger.js';
import { draw, drawJoinedLines, getNewContext } from '../../drawing';
import { getCursor } from '../../util/segmentation';

const logger = getLogger('tools:ScissorsTool');

const brushModule = store.modules.brush;
const { getters } = brushModule;

/**
 * Gets The cursor according to strategy.
 *
 * @protected
 * @abstract
 * @param  {string} toolName the name of the tool.
 * @param  {string} strategy the operation strategy.
 * @returns {MouseCursor}
 */
function _getCursor(toolName, strategy) {
  return getCursor(toolName, strategy);
}

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
  const handles = this.handles;

  draw(context, context => {
    if (handles.points.length > 1) {
      for (let j = 0; j < handles.points.length; j++) {
        const lines = [...handles.points[j].lines];
        const points = handles.points;

        if (j === points.length - 1) {
          // If it's still being actively drawn, keep the last line to
          // The mouse location
          lines.push(this.handles.points[0]);
        }
        drawJoinedLines(context, element, this.handles.points[j], lines, {
          color,
        });
      }
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

  if (!this.handles.points.length) {
    logger.warn('Something went wrong, empty handles detected.');

    return null;
  }

  this.handles.points.push({
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

  const { labelmap3D, currentImageIdIndex } = getters.getAndCacheLabelmap2D(
    element
  );

  const segmentationData =
    labelmap3D.labelmaps2D[currentImageIdIndex].pixelData;

  evt.OperationData = {
    points,
    segmentationData,
  };

  this.applyActiveStrategy(evt);

  // TODO: Future: 3D propagation (unlimited, positive, negative, symmetric)

  // Invalidate the brush tool data so it is redrawn
  labelmap3D.labelmaps2D[currentImageIdIndex].invalidated = true;

  this._resetHandles();
  external.cornerstone.updateImage(evt.detail.element);
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
  if (this.handles.points.length) {
    // Add the line from the current handle to the new handle
    this.handles.points[this.currentHandle - 1].lines.push({
      x: evt.currentPoints.image.x,
      y: evt.currentPoints.image.y,
      lines: [],
    });
  }

  // Add the new handle
  this.handles.points.push({
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
  _addPoint,
  _applyStrategy,
  _getCursor,
  renderToolData,
  _resetHandles,
  _startOutliningRegion,
  _setHandlesAndUpdate,
};