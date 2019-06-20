import external from '../externalModules.js';
import BaseTool from './base/BaseTool.js';
// Drawing
import { draw, drawCircle, drawHandles, getNewContext } from '../drawing/index.js';
import toolColors from '../stateManagement/toolColors.js';
// TODO: Add GrowCutSegmenter cursor
import { wwwcRegionCursor } from './cursors/index.js';
import { modules } from '../store/index.js'

/**
 * @public
 * @class GrowCutSegmenterTool
 * @memberof Tools
 *
 * @classdesc Tool for slicing brush pixel data
 * @extends Tools.Base.BaseTool
 */
export default class GrowCutSegmenterTool extends BaseTool {
  /** @inheritdoc */
  constructor(props = {}) {
    const defaultProps = {
      name: 'GrowCutSegmenter',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: {
      },
      svgCursor: null,
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
   * Render hook: draws the GrowCutSegmenter's outline, box, or circle
   *
   * @param {Cornerstone.event#cornerstoneimagerendered} evt cornerstoneimagerendered event
   * @memberof Tools.GrowCutSegmenterTool
   * @returns {void}
   */
  renderToolData(evt) {
    const eventData = evt.detail;
    const { element } = eventData;
    const color = toolColors.getColorIfActive({ active: true });
    const context = getNewContext(eventData.canvasContext.canvas);
    const handles = this.handles;

    draw(context, context => {

      // Configure
      const startCanvas = external.cornerstone.pixelToCanvas(
        element,
        this.handles.start
      );

      const endCanvas = external.cornerstone.pixelToCanvas(
        element,
        this.handles.end
      );

      // Calculating the radius where startCanvas is the center of the circle to be drawn
      const radius = _getDistance(startCanvas, endCanvas);

      // Draw Circle
      drawCircle(
        context,
        element,
        this.handles.start,
        radius,
        {
          color,
        },
        'pixel'
      );

      drawHandles(context, eventData, [this.handles.start]);
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
    const element = evt.detail.element;
    const image = evt.detail.currentPoints.image;

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
    if (
      _isEmptyObject(this.handles.start) ||
      _isEmptyObject(this.handles.end)
    ) {
      return;
    }

    const { element } = evt.detail;

    evt.detail.handles = this.handles;
    _applySegmentationChanges(evt, this.configuration, this.handles);

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
      end: {}
    };
  }
}

/**
 * Helper to determine if an object has no keys and is the correct type (is empty)
 *
 * @private
 * @function _isEmptyObject
 * @param {Object} obj The object to check
 * @returns {Boolean} true if the object is empty
 */
const _isEmptyObject = obj =>
  Object.keys(obj).length === 0 && obj.constructor === Object;


function _applySegmentationChanges(evt, config, points) {
  const eventData = evt.detail;
  const { image, element } = eventData;
  const brushModule = modules.brush;

  const previewLabelmapIndex = 1;
  const labelmap = brushModule.setters.activeLabelmap(element, previewLabelmapIndex)
  const previewToolData = brushModule.getters.labelmapBuffers(element, previewLabelmapIndex);

  brushModule.getters.getAndCacheLabelmap2D(element);

  // TODO: This is only reading from the first image in the volume for now
  const arrayLength = image.width * image.height * 2
  const segmentationData = new Uint16Array(previewToolData.buffer, 0, arrayLength)

  // TODO: Hardcoded! Only sets a value of 1 in the labelmap
  const labelValue = 1

  const previewLabelValue = 2
  growCutSegmenterTool(points, segmentationData, image, previewLabelValue)

  const activeLabelmapIndex = 0; // TODO: Hardcoded for now, only works on first labelmap!
  //const toolData = brushModule.getters.labelmapBuffers(element, activeLabelmapIndex);

  // Invalidate the brush tool data so it is redrawn
  brushModule.setters.invalidateBrushOnEnabledElement(element, previewLabelmapIndex);

  // TODO: If the segmentation is 'confirmed', dump this new data into the original labelmap
  // - Use only the bounding box of the ROI that we know has changed
};

function growCutSegmenterTool(points, segmentationData, image, labelValue = 1) {
  const { width, height } = image;

  // Create a new ArrayBuffer
  // TODO: We will need to display some preview image, so maybe this should be another labelmapIndex in the brush tool data?
  const labelmapData = segmentationData; // new Uint8Array(segmentationData.length);

  // Set the center point of the circle to the 'inside'
  const insideValue = 1
  const { x, y } = points.start;
  const xRound = Math.round(x);
  const yRound = Math.round(y);

  labelmapData[yRound * width + xRound] = insideValue;

  // Set the circumference points to the 'outside'
  const radius = _getDistance(points.end, points.start);
  const circumferencePoints = getCircumferencePoints(points.start, radius, width, height);

  const outsideValue = 1;//2
  circumferencePoints.forEach(point => {
    const { x, y } = point;
    const xRound = Math.round(x);
    const yRound = Math.round(y);

    labelmapData[yRound * width + xRound] = outsideValue;
  });

  // TODO: Potential performance improvement:
  // - Find the bounding box of the circle
  // - Extract only the background volume within that bounding box, across all slices
  // - Create labelmap which is the size of only the bounding box for use by GrowCut GLSL filter
  // - After algorithm completes, push preview data back into full volume so that it can be visualized.
  //growCutAlgorithm(backgroundVolume, labelmapData);
}


// TODO: Surely this is in cornerstoneMath?? Why are we duplicating it?
/**
 * Returns the distance in canvas from the given coords to the center of the circle annotation.
 *
 * @param {*} startCoords - start point cooridnates
 * @param {*} endCoords - end point cooridnates
 * @returns {number} number - the distance between two points (start and end)
 */
function _getDistance(startCoords, endCoords) {
  const dx = startCoords.x - endCoords.x;
  const dy = startCoords.y - endCoords.y;

  return Math.sqrt(dx * dx + dy * dy);
}

function getCircumferencePoints(center, radius, width, height) {
  const points = [];
  for (let i = 0; i < 360; i++) {
    const angleRadians = i * Math.PI / 180;
    let x = radius * Math.cos(angleRadians) + center.x;
    x = Math.min(x, width);
    x = Math.max(x, 0);
    let y = radius * Math.sin(angleRadians) + center.y;
    y = Math.min(y, height);
    y = Math.max(y, 0);

    points.push({
      x,
      y
    });
  }

  return points;
}
