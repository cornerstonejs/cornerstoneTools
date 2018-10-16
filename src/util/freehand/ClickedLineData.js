/**
 * @export @public @class
 * @name ClickedLineData
 * @classdesc Creates an object containing information about the clicked line.
 * @property {number} toolIndex ID of the tool that the line corresponds to.
 * @property {object} handleIndexArray An array of the handle indicies that correspond to the line segment.
 */
export default class ClickedLineData {
  /**
  * Constructs an object containing information about the clicked line.
  * @param {number} toolIndex - The ID of the tool the line corresponds to.
  * @param {object} handleIndexArray - An array of the handle indicies that correspond to the line segment.
  */
  constructor (toolIndex, handleIndexArray) {
    this.toolIndex = toolIndex;
    this.handleIndexArray = handleIndexArray;
  }
}
