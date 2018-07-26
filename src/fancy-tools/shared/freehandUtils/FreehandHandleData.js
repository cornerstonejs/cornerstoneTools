
/**
 * @typedef {Object} FreehandHandleData
 * @property {Number} x The x position.
 * @property {Number} y The y position.
 * @property {Boolean} highlight Whether the handle should be rendered as the highlighted color.
 * @property {Boolean} active Whether the handle is active.
 * @property {Object} lines An array of lines associated with the handle.
 */
export class FreehandHandleData {

  /**
  * Constructs a a single handle for the freehand tool
  *
  * @param {Object} position - The position of the handle.
  * @param {Boolean} highlight - whether the handle should be rendered as the highlighted color.
  * @param {Boolean} active - whether the handle is active.
  */
  constructor (position, highlight = true, active = true) {
    this.x = position.x;
    this.y = position.y;
    this.highlight = highlight;
    this.active = active;
    this.lines = [];
  }
}
