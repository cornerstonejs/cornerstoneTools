import { getToolState } from '../../stateManagement/toolState.js';
import external from '../../externalModules.js';
import ClickedLineData from './ClickedLineData.js';

const toolType = 'FreehandMouse';
const distanceThreshold = 10;

/**
 * @export @public @class
 * @name FreehandLineFinder
 * @classdesc Class that finds lines of freehand ROIs based on click proximity.
 */
export default class FreehandLineFinder {
  /**
  * Constructs a linefinder with the eventdata
  * @public @method
  *
  * @param {Object} eventData - Data object associated with the event.
  */
  constructor (eventData) {
    this._eventData = eventData;
  }

  /**
  * Looks for lines near the mouse cursor.
  * @public @method
  *
  * @returns {ClickedLineData} Data object corresponding to the clicked line.
  */
  findLine () {
    const closestToolIndex = this.findTool();

    if (closestToolIndex === null) {
      return null;
    }

    const closeLines = this._getCloseLinesInTool(closestToolIndex);

    if (closeLines) {
      const clickedLineData = this._findCorrectLine(closestToolIndex, closeLines);

      // Note: clickedLineData may be null if no valid projections are found.
      return clickedLineData;
    }

    // Return null if no valid close lines found.
    return null;
  }

  /**
  * Looks for tools near the mouse cursor.
  * @public @method
  *
  * @returns {ClickedLineData} Data object corresponding to the clicked line.
  */
  findTool () {
    this._toolData = getToolState(this._eventData.element, toolType);
    this._mousePoint = this._eventData.currentPoints.canvas;

    if (!this._toolData) {
      return null;
    }

    const closestHandle = this._nearestHandleToPointAllTools();

    return closestHandle.toolIndex;
  }

  /**
  * Finds the nearest handle to the mouse cursor for all tools.
  * @private @method
  *
  * @returns {object} The handle closest to the point.
  */
  _nearestHandleToPointAllTools () {
    const toolData = this._toolData;

    let closestHandle = {
      toolIndex: null,
      handleIndex: null,
      distance: Infinity // Some large number
    };

    for (let toolIndex = 0; toolIndex < toolData.data.length; toolIndex++) {
      const closestHandleForToolI = this._nearestHandleToPoint(toolIndex);

      if (closestHandleForToolI === null) {
        continue;
      }

      if (closestHandleForToolI.distance < closestHandle.distance) {
        closestHandle = closestHandleForToolI;
      }
    }

    return closestHandle;
  }

  /**
  * Finds the nearest handle to the mouse cursor for a specific tool.
  * @private @method
  *
  * @param {number} toolIndex The index of the particular freehand tool.
  * @return {object} An object containing information about the closest handle.
  */
  _nearestHandleToPoint (toolIndex) {
    const eventData = this._eventData;
    const toolData = this._toolData;

    const data = toolData.data[toolIndex];

    if (data.handles === undefined) {
      return null;
    }

    if (data.visible === false) {
      return null;
    }

    const closest = {
      toolIndex,
      handleIndex: null,
      distance: Infinity // Some large number
    };

    for (let i = 0; i < data.handles.length; i++) {
      const handleCanvas = external.cornerstone.pixelToCanvas(eventData.element, data.handles[i]);
      const handleDistanceFromMousePoint = external.cornerstoneMath.point.distance(handleCanvas, this._mousePoint);

      if (handleDistanceFromMousePoint < closest.distance) {
        closest.handleIndex = i;
        closest.distance = handleDistanceFromMousePoint;
      }
    }

    return closest;
  }

  /**
  * Finds all the lines close to the mouse point for a particular tool.
  * @private @method
  *
  * @param {number} toolIndex The index of the particular freehand tool.
  * @returns {object} An array of lines close to the mouse point.
  */
  _getCloseLinesInTool (toolIndex) {
    const toolData = this._toolData;
    const dataHandles = toolData.data[toolIndex].handles;

    const closeLines = [];

    for (let i = 0; i < dataHandles.length; i++) {
      const nextIndex = FreehandLineFinder.getNextHandleIndex(i, dataHandles.length);
      const d = this._distanceOfPointfromLine(dataHandles[i], dataHandles[nextIndex]);

      if (d < distanceThreshold) {
        closeLines.push([
          i,
          nextIndex
        ]);
      }
    }

    return closeLines;
  }

  /**
  * Finds the line the user clicked on from an array of close lines.\
  * @private @method
  *
  * @param {number} toolIndex The index of the particular freehand tool.
  * @param {object} closeLines An array of lines close to the mouse point.
  * @returns {ClickedLineData|null} An instance of ClickedLineData containing information about the line, or null if no line is correct.
  */
  _findCorrectLine (toolIndex, closeLines) {
    // Test if any candidate lines can be projected onto by the mousePoint
    for (let i = 0; i < closeLines.length; i++) {
      if (this._pointProjectsToLineSegment(toolIndex, closeLines[i])) {
        return new ClickedLineData(toolIndex, closeLines[i]);
      }
    }

    // No valid line found
    return null;
  }

  /**
  * Returns true if the mouse point projects onto the line segment.
  * @private @method
  *
  * @param {number} toolIndex The index of the particular freehand tool.
  * @param {object} handleIndexArray An array of indicies corresponding to the line segment.
  * @return {boolean} True if the mouse point projects onto the line segment
  */
  _pointProjectsToLineSegment (toolIndex, handleIndexArray) {
    const eventData = this._eventData;
    const toolData = this._toolData;
    const data = toolData.data[toolIndex];

    if (data.handles === undefined) {
      return;
    }

    if (data.visible === false) {
      return false;
    }

    const handle1 = data.handles[handleIndexArray[0]];
    const handle2 = data.handles[handleIndexArray[1]];

    const p = FreehandLineFinder.getCanvasPointsFromHandles(handle1, handle2, eventData.element);

    const r = FreehandLineFinder.getLineAsVector(p);
    const m = this._getLineOriginToMouseAsVector(p);

    // Project vector m onto r to see if the point is within bounds of line segment
    const mProj = (m[0] * r[0] + m[1] * r[1]) / r.magnitude;

    if (mProj > 0 && mProj < r.magnitude) {
      return true;
    }

    return false;
  }

  /**
  * Returns the canvas positions from the handle's pixel positions.
  * @static @public @method
  *
  * @param {FreehandHandleData} handle1 The first handle.
  * @param {FreehandHandleData} handle2 The second handle.
  * @param {object} element The element on which the handles reside.
  * @returns {object} An array contsining the handle positions in canvas coordinates.
  */
  static getCanvasPointsFromHandles (handle1, handle2, element) {
    const p = [];

    // Point r from left to right so that we only have one orientation to test.
    if (handle1.x < handle2.x) {
      p.push(external.cornerstone.pixelToCanvas(element, handle1));
      p.push(external.cornerstone.pixelToCanvas(element, handle2));
    } else {
      p.push(external.cornerstone.pixelToCanvas(element, handle2));
      p.push(external.cornerstone.pixelToCanvas(element, handle1));
    }

    return p;
  }

  /**
  * Converts a line segment to a vector.
  * @static @public @method
  *
  * @param {object} p An array of two points respresenting the line segment.
  * @return {object} An array containing the x and y components of the vector, as well as a magnitude property.
  */
  static getLineAsVector (p) {
    const r = [
      p[1].x - p[0].x,
      p[1].y - p[0].y
    ];

    r.magnitude = external.cornerstoneMath.point.distance(p[0], p[1]);

    return r;
  }

  /**
  * Constructs a vector from the direction and magnitude of the line from the the line origin to the mouse cursor.
  * @private @method
  *
  * @param {object} p An array of two points respresenting the line segment.
  * @return {object} An array containing the x and y components of the vector.
  */
  _getLineOriginToMouseAsVector (p) {
    const m = [
      this._mousePoint.x - p[0].x,
      this._mousePoint.y - p[0].y
    ];

    return m;
  }

  /**
  * Calculates the perpendicular distance of the mouse cursor from a line segment.
  * @private @method
  *
  * @param {FreehandHandleData} handle1 The first handle.
  * @param {FreehandHandleData} handle2 The first handle.
  * @return {number} The perpendicular distance of the mouse cursor from the line segment.
  */
  _distanceOfPointfromLine (handle1, handle2) {
    const eventData = this._eventData;

    const p1 = external.cornerstone.pixelToCanvas(eventData.element, handle1);
    const p2 = external.cornerstone.pixelToCanvas(eventData.element, handle2);
    const pMouse = this._mousePoint;

    // Perpendicular distance of point from line:
    // = 2* area of triangle(p1,p2,pm) / length of triangle's base |p2 - p1|
    const twiceAreaOfTriangle = Math.abs(((p2.y - p1.y) * pMouse.x - (p2.x - p1.x) * pMouse.y + p2.x * p1.y - p2.y * p1.x));
    const rMagnitude = external.cornerstoneMath.point.distance(p1, p2);
    const d = twiceAreaOfTriangle / rMagnitude;

    return d;
  }


  /**
  * Gets the next handl index from a cyclical array of points.
  * @static @public @method
  *
  * @param {number} currentIndex The current index.
  * @param {number} length The number of handles in the polygon.
  * @return {number} The index of the next handle.
  */
  static getNextHandleIndex (currentIndex, length) {
    let nextIndex;

    if (currentIndex < length - 1) {
      nextIndex = currentIndex + 1;
    } else {
      nextIndex = 0;
    }

    return nextIndex;
  }
}
