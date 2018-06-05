import external from '../../externalModules.js';
import { freehandSculpter } from '../../imageTools/freehandSculpter.js';
import { FreehandHandleData } from './FreehandHandleData.js';

export class Sculpter {
  /* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */

  /**
  * Sculpts the freehand ROI with the circular freehandSculpter tool, moving,
  * adding and removing handles as necessary.
  *
  * @author JamesAPetts
  *
  * @param {Object} eventData - Data object associated with the event.
  * @param {Object} dataHandles - Data object containing tool handle data.
  */
  sculpt (eventData, dataHandles) {
    // Set the objects data to the current context
    this._setData(eventData, dataHandles);
    // Push existing handles radially away from tool.
    this._pushHandles();
    // Insert new handles in sparsely populated areas.
    this._insertNewHandles();
    // If any handles have been pushed very close together or even overlap,
    // Combine these into a single handle.
    this._consolidateHandles();
  }

  /**
  * Sets the data context to be sculpted.
  *
  * @param {Object} eventData - Data object associated with the event.
  * @param {Object} dataHandles - Data object containing tool handle data.
  */
  _setData (eventData, dataHandles) {
    const config = freehandSculpter.getConfiguration();

    this._eventData = eventData;
    this._element = eventData.element;
    this._mousePoint = eventData.currentPoints.image;
    this._dataHandles = dataHandles;
    this._toolSize = config.toolSizeImage;
    this._minSpacing = config.minSpacing;
    this._maxSpacing = config.maxSpacing;
  }

  /**
  * Pushes the handles in dataHandles radially away from the mouse if they are
  * contained within the circle defined by the freehandSculpter's toolSize and
  * the mouse position.
  */
  _pushHandles () {
    const dataHandles = this._dataHandles;
    const mousePoint = this._mousePoint;
    const toolSize = this._toolSize;

    for (let i = 0; i < dataHandles.length; i++) {
      // Push point if inside circle, to edge of circle.
      const handle = dataHandles[i];
      const distanceToHandle = external.cornerstoneMath.point.distance(handle, mousePoint);

      if (distanceToHandle < toolSize) {
        // Push handle

        const directionUnitVector = {
          x: (handle.x - mousePoint.x) / distanceToHandle,
          y: (handle.y - mousePoint.y) / distanceToHandle
        };

        handle.x = mousePoint.x + (toolSize * directionUnitVector.x);
        handle.y = mousePoint.y + (toolSize * directionUnitVector.y);

        // Push lines
        let lastHandleId;

        if (i === 0) {
          lastHandleId = dataHandles.length - 1;
        } else {
          lastHandleId = i - 1;
        }

        dataHandles[lastHandleId].lines.pop();
        dataHandles[lastHandleId].lines.push(handle);
      }
    }
  }

  /**
  * Inserts additional handles in sparsely sampled regions of the contour. The
  * new handles are placed on the circle defined by the the freehandSculpter's
  * toolSize and the mouse position.
  */
  _insertNewHandles () {
    const indiciesToInsertAfter = this._findNewHandleIndicies();
    let newIndexModifier = 0;

    for (let i = 0; i < indiciesToInsertAfter.length; i++) {
      const insertIndex = indiciesToInsertAfter[i] + 1 + newIndexModifier;

      this._insertHandleRadially(insertIndex);
      newIndexModifier++;
    }
  }

  /**
  * Checks dataHandles for any very close handles and consolidates these to a
  * single handle.
  *
  * @param {Object} eventData - Data object associated with the event.
  * @param {Object} dataHandles - Data object containing tool handle data.
  * @modifies {this._dataHandles}
  */
  _consolidateHandles () {
    if (this._dataHandles.length > 3) { // Don't merge handles if it would destroy the polygon.
      const closePairs = this._findCloseHandlePairs();

      this._mergeCloseHandles(closePairs);
    }
  }

  /**
  * Merges handles in dataHandles given a list of close pairs. The handles are
  * merged in an iterative fashion to prevent generating a singularity in some
  * edge cases.
  *
  * @param {Object} closePairs - An array of pairs of handle IDs.
  */
  _mergeCloseHandles (closePairs) {
    let removedIndexModifier = 0;

    for (let i = 0; i < closePairs.length; i++) {
      const pair = [
        closePairs[i][0] - removedIndexModifier,
        closePairs[i][1] - removedIndexModifier
      ];

      this._combineHandles(pair);
      removedIndexModifier++;
    }

    // Recursively remove problem childs
    const newClosePairs = this._findCloseHandlePairs();

    if (newClosePairs.length) {
      this._mergeCloseHandles(newClosePairs);
    }
  }

  /**
  * Returns an array of indicies that describe where new handles should be
  * inserted (where the distance between subsequent handles is >
  * config.maxSpacing).
  *
  * @return {Object} An array of indicies that describe where new handles should be inserted.
  */
  _findNewHandleIndicies () {
    const dataHandles = this._dataHandles;
    const indiciesToInsertAfter = [];

    for (let i = 0; i < dataHandles.length; i++) {
      const handleCanvas = external.cornerstone.pixelToCanvas(this._element, dataHandles[i]);
      let nextHandleCanvas;

      if (i === dataHandles.length - 1) {
        nextHandleCanvas = external.cornerstone.pixelToCanvas(this._element, dataHandles[0]);
      } else {
        nextHandleCanvas = external.cornerstone.pixelToCanvas(this._element, dataHandles[i + 1]);
      }

      const distanceToNextHandleCanvas = external.cornerstoneMath.point.distance(handleCanvas, nextHandleCanvas);

      if (distanceToNextHandleCanvas > this._maxSpacing) {
        indiciesToInsertAfter.push(i);
      }
    }

    return indiciesToInsertAfter;
  }

  /**
  * Finds pairs of close handles with seperations < config.minSpacing. No handle
  * is included in more than one pair, to avoid spurious deletion of densely
  * populated regions of the contour (see mergeCloseHandles).
  *
  * @return {Object} An array of close pairs in dataHandles.
  */
  _findCloseHandlePairs () {
    const dataHandles = this._dataHandles;
    const closePairs = [];

    let length = dataHandles.length;

    for (let i = 0; i < length; i++) {
      const handleCanvas = external.cornerstone.pixelToCanvas(this._element, dataHandles[i]);
      let nextHandleId;

      if (i === dataHandles.length - 1) {
        nextHandleId = 0;
      } else {
        nextHandleId = i + 1;
      }

      const nextHandleCanvas = external.cornerstone.pixelToCanvas(this._element, dataHandles[nextHandleId]);
      const distanceToNextHandleCanvas = external.cornerstoneMath.point.distance(handleCanvas, nextHandleCanvas);

      if (distanceToNextHandleCanvas < this._minSpacing) {
        closePairs.push([
          i,
          nextHandleId
        ]);
        i++; // Don't double count pairs in order to prevent your polygon collapsing to a singularity.

        if (i === 0) {
          length -= 1; // Don't check last node if first in pair to avoid double counting.
        }
      }
    }

    return closePairs;
  }

  /**
  * Combines two handles defined by the indicies in handlePairs.
  *
  * @param {Object} handlePair - A pair of handle IDs.
  */
  _combineHandles (handlePair) {
    const dataHandles = this._dataHandles;

    // Calculate combine position: half way between the handles.
    const midPoint = {
      x: (dataHandles[handlePair[0]].x + dataHandles[handlePair[1]].x) / 2.0,
      y: (dataHandles[handlePair[0]].y + dataHandles[handlePair[1]].y) / 2.0
    };

    // Move first point to midpoint
    dataHandles[handlePair[0]].x = midPoint.x;
    dataHandles[handlePair[0]].y = midPoint.y;

    // Link first point to handle that second point links to.
    let handleAfterPairId;

    if (handlePair[1] === dataHandles.length - 1) {
      handleAfterPairId = 0;
    } else {
      handleAfterPairId = handlePair[1] + 1;
    }

    dataHandles[handlePair[0]].lines.pop();
    dataHandles[handlePair[0]].lines.push(dataHandles[handleAfterPairId]);

    // Remove the handle
    dataHandles.splice(handlePair[1], 1);
  }

  /**
  * Inserts a handle on the surface of the circle defined by toolSize and the
  * mousePoint.
  *
  * @param {Object} insertIndex - The index to insert the new handle.
  */
  _insertHandleRadially (insertIndex) {
    const dataHandles = this._dataHandles;
    const mousePoint = this._mousePoint;
    const toolSize = this._toolSize;
    const previousIndex = insertIndex - 1;
    let nextIndex;

    if (insertIndex === dataHandles.length) {
      nextIndex = 0;
    } else {
      // A 'GOTCHA' here: The line bellow is correct, as we haven't inserted our handle yet!
      nextIndex = insertIndex;
    }

    // Calculate insert position: half way between the handles, then pushed out
    // Radially to the edge of the freehandSculpter.
    const midPoint = {
      x: (dataHandles[previousIndex].x + dataHandles[nextIndex].x) / 2.0,
      y: (dataHandles[previousIndex].y + dataHandles[nextIndex].y) / 2.0
    };

    const distanceToMidPoint = external.cornerstoneMath.point.distance(mousePoint, midPoint);

    const directionUnitVector = {
      x: (midPoint.x - mousePoint.x) / distanceToMidPoint,
      y: (midPoint.y - mousePoint.y) / distanceToMidPoint
    };

    const insertPosition = {
      x: mousePoint.x + (toolSize * directionUnitVector.x),
      y: mousePoint.y + (toolSize * directionUnitVector.y)
    };

    // Add the new handle
    const handleData = new FreehandHandleData(insertPosition);

    dataHandles.splice(insertIndex, 0, handleData);

    // Add the line from the previous handle to the inserted handle (note the tool is now one increment longer)
    dataHandles[previousIndex].lines.pop();
    dataHandles[previousIndex].lines.push(dataHandles[insertIndex]);

    // Add the line from the inserted handle to the handle after
    if (insertIndex === dataHandles.length - 1) {
      dataHandles[insertIndex].lines.push(dataHandles[0]);
    } else {
      dataHandles[insertIndex].lines.push(dataHandles[insertIndex + 1]);
    }
  }

}
