import external from '../externalModules.js';
import BaseTool from './base/BaseTool.js';
// Drawing
import { draw, drawRect, drawJoinedLines, getNewContext } from '../drawing/index.js';
import toolColors from '../stateManagement/toolColors.js';
// TODO: Add scissors cursor
import { wwwcRegionCursor } from './cursors/index.js';
import { modules } from '../store/index.js'

/**
 * @public
 * @class ScissorsTool
 * @memberof Tools
 *
 * @classdesc Tool for slicing brush pixel data
 * @extends Tools.Base.BaseTool
 */
export default class ScissorsTool extends BaseTool {
  /** @inheritdoc */
  constructor(props = {}) {
    const defaultProps = {
      name: 'Scissors',
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
   * Render hook: draws the Scissors's outline, box, or circle
   *
   * @param {Cornerstone.event#cornerstoneimagerendered} evt cornerstoneimagerendered event
   * @memberof Tools.ScissorsTool
   * @returns {void}
   */
  renderToolData(evt) {
    const eventData = evt.detail;
    const { element } = eventData;
    const color = toolColors.getColorIfActive({ active: true });
    const context = getNewContext(eventData.canvasContext.canvas);

    const strategy = 'freehand';
    const handles = this.handles;

    draw(context, context => {
      switch(strategy) {
        case 'circle':
          break;
        case 'rectangle':
          drawRect(context, element, this.handles.start, this.handles.end, {
            color,
          });
          break;
        case 'freehand':
        default:
            if (handles.points.length > 1) {
              for (let j = 0; j < handles.points.length; j++) {
                const lines = [...handles.points[j].lines];
                const points = handles.points;

                if (j === points.length - 1) {
                  // If it's still being actively drawn, keep the last line to
                  // The mouse location
                  lines.push(this.handles.points[0]);
                }
                drawJoinedLines(
                  context,
                  eventData.element,
                  this.handles.points[j],
                  lines,
                  { color }
                );
              }
            }
          break;
      }
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

    if (!this.handles.points.length) {
      this.handles.points.push({
        x: image.x,
        y: image.y,
        lines: []
      });
      this.currentHandle += 1;
    } else {
      this.handles.points.push({
        x: image.x,
        y: image.y,
        lines: []
      });
      this.currentHandle += 1;
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
    const eventData = evt.detail;
    const element = evt.detail.element;

    const config = this.configuration;
    const currentTool = config.currentTool;

    this._addPointPencilMode(eventData, this.handles.points);
    this._dragging = true;

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
    const { element } = evt.detail;

    evt.detail.handles = this.handles;
    _applySegmentationChanges(evt, this.configuration, this.handles.points);
    this._resetHandles();

    external.cornerstone.updateImage(element);
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
      points: [],
    };

    this.currentHandle = 0;
  }

  /**
   * If in pencilMode, check the mouse position is farther than the minimum
   * distance between points, then add a point.
   *
   * @private
   * @param {Object} eventData - Data object associated with an event.
   * @param {Object} points - Data object associated with the tool.
   * @returns {undefined}
   */
  _addPointPencilMode(eventData, points) {
    const config = this.configuration;
    const element = eventData.element;
    /*const mousePoint = config.mouseLocation.handles.start;

    const handleFurtherThanMinimumSpacing = handle =>
      this._isDistanceLargerThanSpacing(element, handle, mousePoint);

    if (points.every(handleFurtherThanMinimumSpacing)) {*/
      this._addPoint(eventData);
    //}
  }

  /**
   * Adds a point on mouse click in polygon mode.
   *
   * @private
   * @param {Object} eventData - data object associated with an event.
   * @returns {undefined}
   */
  _addPoint(eventData) {
    const config = this.configuration;

    // If this is not the first handle
    if (this.handles.points.length) {
      // Add the line from the current handle to the new handle
      this.handles.points[this.currentHandle - 1].lines.push({
        x: eventData.currentPoints.image.x,
        y: eventData.currentPoints.image.y,
        lines: []
      });
    }

    // Add the new handle
    this.handles.points.push({
      x: eventData.currentPoints.image.x,
      y: eventData.currentPoints.image.y,
      lines: []
    });

    // Increment the current handle value
    this.currentHandle += 1;

    // Force onImageRendered to fire
    external.cornerstone.updateImage(eventData.element);
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
  const activeLabelmapIndex = 0; // TODO: Hardcoded for now, only works on first labelmap!
  const toolData = brushModule.getters.labelmapBuffers(element, activeLabelmapIndex);

  // TODO: This is only reading from the first image in the volume for now
  const arrayLength = image.width * image.height * 2
  const segmentationData = new Uint16Array(toolData.buffer, 0, arrayLength)

  // TODO: Hardcoded! Only sets a value of 1 in the labelmap
  const labelValue = 1

  switch (config.strategy) {
    case 'FILL_INSIDE':
    default:
      console.warn('fill inside!');
      fillInside(points, segmentationData, image, labelValue)
      break;
    case 'FILL_OUTSIDE':
      fillOutside(points, segmentationData, image, labelValue)
      break;
    case 'ERASE_OUTSIDE':
      fillOutside(points, segmentationData, image, 0)
      break;
    case 'ERASE_INSIDE':
      fillInside(points, segmentationData, image, 0)
      break;
  }

  // TODO: Future: 3D propagation (unlimited, positive, negative, symmetric)

  // Invalidate the brush tool data so it is redrawn
  brushModule.setters.invalidateBrushOnEnabledElement(element, activeLabelmapIndex);
};

function fillInside(points, segmentationData, image, labelValue = 1) {
  // Loop through all pixels in the segmentation data mask

  // Obtain the bounding box of the entire drawing so that
  // we can subset our search. Outside of the bounding box,
  // everything is outside of the polygon.
  const { width } = image;
  const vertices = points.map(a => [a.x, a.y]);
  const [topLeft, bottomRight] = getBoundingBoxAroundPolygon(vertices);
  console.log(`topLeft: ${topLeft}, bottomRight: ${bottomRight}`);
  const [xMin, yMin] = topLeft;
  const [xMax, yMax] = bottomRight;

  let painted = 0;
  // Loop through all of the points inside the bounding box
  for (let i = xMin; i < xMax; i++) {
    for (let j = yMin; j < yMax; j++) {
      // If they are inside of the region defined by the array of points, set their value to labelValue
      const inside = pointInPolygon([i, j], vertices);

      if (inside) {
        segmentationData[j * width + i] = labelValue;
        painted++
      }
    }
  }

  console.log(`painted: ${painted}`);
}

function fillOutside() {
  // Loop through all pixels in the segmentation data mask
  // If they are outside of the region defined by the array of points, set their value to labelValue
}

function getBoundingBoxAroundPolygon(vertices) {
  let xMin = Infinity;
  let xMax = 0;
  let yMin = Infinity;
  let yMax = 0;

  vertices.forEach(v => {
    xMin = Math.min(v[0], xMin);
    xMax = Math.max(v[0], xMax);
    yMin = Math.min(v[1], yMin);
    yMax = Math.max(v[1], yMax);
  });

  xMin = Math.round(xMin);
  yMin = Math.round(yMin);
  xMax = Math.round(xMax);
  yMax = Math.round(yMax);

  return [[xMin, yMin], [xMax, yMax]];
}

/**
 * Checks whether a point is inside a polygon
 *
 * @param point The point [x1, y1]
 * @param vs The vertices [[x1, y1], [x2, y2], ...] of the Polygon
 * @return {boolean}
 */
function pointInPolygon(point, vs) {
  // https://github.com/substack/point-in-polygon/blob/master/index.js
  // ray-casting algorithm based on
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
  //
  // We might want to try this one instead: https://github.com/mikolalysenko/robust-point-in-polygon

  let x = point[0], y = point[1];

  let inside = false;
  for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    var xi = vs[i][0], yi = vs[i][1];
    var xj = vs[j][0], yj = vs[j][1];

    var intersect = ((yi > y) !== (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}
