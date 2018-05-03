import { getToolState } from '../../stateManagement/toolState.js';
import { ClickedLineData } from './ClickedLineData.js';
import external from '../../externalModules.js';

const toolType = 'freehand';
const distanceThreshold = 10;

export class FreehandLineFinder {
  /* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */

  constructor (eventData) {
    this._eventData = eventData;
  }

  findLine () {
    this._toolData = getToolState(this._eventData.element, toolType);
    this._mousePoint = this._eventData.currentPoints.canvas;

    if (!this._toolData) {
      return null;
    }

    const closestHandle = this._nearestHandleToPointAllTools();
    const closestToolIndex = closestHandle.toolIndex;

    const closeLines = this._getCloseLinesInTool(closestToolIndex);

    if (closeLines) {
      const clickedLineData = this._findCorrectLine(closestToolIndex, closeLines);

      // Note: clickedLineData may be null if no valid projections are found.
      return clickedLineData;
    }

    // Return null if no valid close lines found.
    return null;
  }

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

  static getCanvasPointsFromHandles (handle1, handle2, element) {
    // Point r from left to right so that we only have one orientation to test.
    const p = [];

    if (handle1.x < handle2.x) {
      p.push(external.cornerstone.pixelToCanvas(element, handle1));
      p.push(external.cornerstone.pixelToCanvas(element, handle2));
    } else {
      p.push(external.cornerstone.pixelToCanvas(element, handle2));
      p.push(external.cornerstone.pixelToCanvas(element, handle1));
    }

    return p;
  }

  static getLineAsVector (p) {
    const r = [
      p[1].x - p[0].x,
      p[1].y - p[0].y
    ];

    r.magnitude = external.cornerstoneMath.point.distance(p[0], p[1]);

    return r;
  }

  _getLineOriginToMouseAsVector (p) {
    const m = [
      this._mousePoint.x - p[0].x,
      this._mousePoint.y - p[0].y
    ];

    return m;
  }


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
