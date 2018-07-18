import baseTool from './baseTool.js';

export default class extends baseTool {
  constructor ({ name, strategies, defaultStrategy, configuration }) {
    super({
      name,
      strategies,
      defaultStrategy,
      configuration
    });

    this.isAnnotationTool = true;
  }

  createNewMeasurement (evt) {
    console.warn(`createNewMeasurement not implemented for ${this.toolName}`);
  }

  /**
   * @param {*} element
   * @param {*} data
   * @param {*} coords
   * @returns {boolean} If the point is near the tool
   */
  pointNearTool (element, data, coords) {
    console.warn(`pointNearTool not implemented for ${this.toolName}`);
  }

  /**
   * @param {*} element
   * @param {*} data
   * @param {*} coords
   * @returns {number} the distance in px from the provided coordinates to the
   * closest rendered portion of the annotation. -1 if the distance cannot be
   * calculated.
   */
  distanceFromPoint (element, data, coords) {
    console.warn(`distanceFromPoint not implemented for ${this.toolName}`);
  }

  /**
   * Used to redraw the tool's annotation data per render
   *
   * @param {*} evt
   */
  onImageRendered (evt) {
    console.warn(`onImageRendered not implemented for ${this.toolName}`);
  }
}
