/**
 * @typedef {Object} ClickedLineData
 * @property {Number} toolIndex ID of the tool that the line corresponds to.
 * @property {Object} handleIndexArray An array of the handle indicies that correspond to the line segment.
 */
export class ClickedLineData {

  /**
  * Constructs an object containing information about the clicked line.
  *
  * @param {Number} toolIndex - The ID of the tool the line corresponds to.
  * @param {Object} handleIndexArray - An array of the handle indicies that correspond to the line segment.
  */
  constructor (toolIndex, handleIndexArray) {
    this.toolIndex = toolIndex;
    this.handleIndexArray = handleIndexArray;
  }
}
