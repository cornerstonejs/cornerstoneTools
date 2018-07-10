import external from '../../externalModules.js';
import { freehandSculpter } from '../../imageTools/freehandSculpter.js';
import { FreehandHandleData } from './FreehandHandleData.js';
import { clipToBox } from '../clip.js';

export class Sculpter {
  /* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */

  /**
  * Sculpts the freehand ROI with the circular freehandSculpter tool, moving,
  * adding and removing handles as necessary.
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
    this._image = eventData.image;
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
      const distanceToHandle = external.cornerstoneMath.point.distance(dataHandles[i], mousePoint);

      // Push point if inside circle, to edge of circle.
      if (distanceToHandle < toolSize) {
        this._pushOneHandle(i, distanceToHandle);
      }
    }
  }

  /**
  * Pushes by one handle.
  *
  * @param {Number} i - The index of the handle to push.
  * @param {Number} distanceToHandle - The distance between the mouse cursor and the handle.
  */
  _pushOneHandle (i, distanceToHandle) {
    const dataHandles = this._dataHandles;
    const handle = dataHandles[i];
    const mousePoint = this._mousePoint;
    const toolSize = this._toolSize;

    const directionUnitVector = {
      x: (handle.x - mousePoint.x) / distanceToHandle,
      y: (handle.y - mousePoint.y) / distanceToHandle
    };

    const position = {
      x: mousePoint.x + (toolSize * directionUnitVector.x),
      y: mousePoint.y + (toolSize * directionUnitVector.y)
    };

    clipToBox(position, this._image);

    handle.x = position.x;
    handle.y = position.y;

    // Push lines
    const lastHandleIndex = Sculpter.getPreviousHandleIndex(i, dataHandles.length);

    dataHandles[lastHandleIndex].lines.pop();
    dataHandles[lastHandleIndex].lines.push(handle);
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
      const nextHandleIndex = Sculpter.getNextHandleIndex(i, dataHandles.length);

      const nextHandleCanvas = external.cornerstone.pixelToCanvas(this._element, dataHandles[nextHandleIndex]);
      const distanceToNextHandleCanvas = external.cornerstoneMath.point.distance(handleCanvas, nextHandleCanvas);

      if (distanceToNextHandleCanvas > this._maxSpacing) {
        indiciesToInsertAfter.push(i);
      }
    }

    return indiciesToInsertAfter;
  }

  /**
  * Inserts a handle on the surface of the circle defined by toolSize and the
  * mousePoint.
  *
  * @param {Object} insertIndex - The index to insert the new handle.
  */
  _insertHandleRadially (insertIndex) {
    const dataHandles = this._dataHandles;

    const previousIndex = insertIndex - 1;
    const nextIndex = Sculpter.getNextHandleIndexBeforeInsert(insertIndex, dataHandles.length);
    const insertPosition = this._getInsertPosition(insertIndex, previousIndex, nextIndex);
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

  /**
  * Calculates the position that a new handle should be inserted.
  *
  * @param {Number} insertIndex - The index to insert the new handle.
  * @param {Number} previousIndex - The previous index.
  * @param {Number} nextIndex - The next index.
  * @returns {Object} The position the handle should be inserted.
  */
  _getInsertPosition (insertIndex, previousIndex, nextIndex) {
    const toolSize = this._toolSize;
    const mousePoint = this._mousePoint;
    const dataHandles = this._dataHandles;

    // Calculate insert position: half way between the handles, then pushed out
    // Radially to the edge of the freehandSculpter.
    const midPoint = {
      x: (dataHandles[previousIndex].x + dataHandles[nextIndex].x) / 2.0,
      y: (dataHandles[previousIndex].y + dataHandles[nextIndex].y) / 2.0
    };

    const distanceToMidPoint = external.cornerstoneMath.point.distance(mousePoint, midPoint);

    let insertPosition;

    if (distanceToMidPoint < toolSize) {
      const directionUnitVector = {
        x: (midPoint.x - mousePoint.x) / distanceToMidPoint,
        y: (midPoint.y - mousePoint.y) / distanceToMidPoint
      };

      insertPosition = {
        x: mousePoint.x + (toolSize * directionUnitVector.x),
        y: mousePoint.y + (toolSize * directionUnitVector.y)
      };
    } else {
      insertPosition = midPoint;
    }

    clipToBox(insertPosition, this._image);

    return insertPosition;
  }

  /**
  * Checks dataHandles for any very close handles and consolidates these to a
  * single handle.
  *
  * @param {Object} eventData - Data object associated with the event.
  * @param {Object} dataHandles - Data object containing tool handle data.
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
  * @param {Object} closePairs - An array of pairs of handle indicies.
  */
  _mergeCloseHandles (closePairs) {
    let removedIndexModifier = 0;

    for (let i = 0; i < closePairs.length; i++) {
      const pair = Sculpter.getCorrectedPair(closePairs[i], removedIndexModifier);

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
  * Finds pairs of close handles with seperations < config.minSpacing. No handle
  * is included in more than one pair, to avoid spurious deletion of densely
  * populated regions of the contour (see mergeCloseHandles).
  *
  * @return {Object} An array of close pairs in dataHandles.
  */
  _findCloseHandlePairs () {
    const dataHandles = this._dataHandles;
    const element = this._element;
    const closePairs = [];

    let length = dataHandles.length;

    for (let i = 0; i < length; i++) {
      const handleCanvas = external.cornerstone.pixelToCanvas(element, dataHandles[i]);
      const nextHandleIndex = Sculpter.getNextHandleIndex(i, dataHandles.length);

      const nextHandleCanvas = external.cornerstone.pixelToCanvas(element, dataHandles[nextHandleIndex]);
      const distanceToNextHandleCanvas = external.cornerstoneMath.point.distance(handleCanvas, nextHandleCanvas);

      if (distanceToNextHandleCanvas < this._minSpacing) {
        const pair = [
          i,
          nextHandleIndex
        ];

        closePairs.push(pair);

        // Don't check last node if first in pair to avoid double counting.
        if (i === 0) {
          length -= 1;
        }

        // Don't double count pairs in order to prevent your polygon collapsing to a singularity.
        i++;
      }
    }

    return closePairs;
  }

  /**
  * Combines two handles defined by the indicies in handlePairs.
  *
  * @param {Object} handlePair - A pair of handle indicies.
  */
  _combineHandles (handlePair) {
    const dataHandles = this._dataHandles;

    // Calculate combine position: half way between the handles.
    const midPoint = {
      x: (dataHandles[handlePair[0]].x + dataHandles[handlePair[1]].x) / 2.0,
      y: (dataHandles[handlePair[0]].y + dataHandles[handlePair[1]].y) / 2.0
    };

    clipToBox(midPoint, this._image);

    // Move first point to midpoint
    dataHandles[handlePair[0]].x = midPoint.x;
    dataHandles[handlePair[0]].y = midPoint.y;

    // Link first point to handle that second point links to.
    const handleAfterPairIndex = Sculpter.getNextHandleIndex(handlePair[1], dataHandles.length);

    dataHandles[handlePair[0]].lines.pop();
    dataHandles[handlePair[0]].lines.push(dataHandles[handleAfterPairIndex]);

    // Remove the latter handle
    dataHandles.splice(handlePair[1], 1);
  }

  /**
  * Returns the next handle index.
  *
  * @param {Number} i - The handle index.
  * @param {Number} length - The length of the polygon.
  * @returns {Number} The next handle index.
  */
  static getNextHandleIndex (i, length) {
    if (i === length - 1) {
      return 0;
    }

    return i + 1;
  }

  /**
  * Returns the next handle index, with a correction considering a handle is
  * about to be inserted.
  *
  * @param {Number} insertIndex - The index in which the handle is being inserted.
  * @param {Number} length - The length of the polygon.
  * @returns {Number} The next handle index.
  */
  static getNextHandleIndexBeforeInsert (insertIndex, length) {
    if (insertIndex === length) {
      return 0;
    }
    // Index correction here: The line bellow is correct, as we haven't inserted our handle yet!

    return insertIndex;
  }

  /**
  * Returns the previous handle index.
  *
  * @param {Number} i - The handle index.
  * @param {Number} length - The length of the polygon.
  * @returns {Number} The previous handle index.
  */
  static getPreviousHandleIndex (i, length) {
    if (i === 0) {
      return length - 1;
    }

    return i - 1;
  }

  /**
  * Given a pair of indicies, and the number of points already removed,
  * convert to the correct live indicies.
  *
  * @param {Object} pair - A pairs of handle indicies.
  * @param {Number} removedIndexModifier - The number of handles already removed.
  * @returns {Object} - The corrected pair of handle indicies.
  */
  static getCorrectedPair (pair, removedIndexModifier) {
    const correctedPair = [
      pair[0] - removedIndexModifier,
      pair[1] - removedIndexModifier
    ];

    // Deal with edge case of last node + first node.
    if (correctedPair[1] < 0) {
      correctedPair[1] = 0;
    }

    return correctedPair;
  }

}
