import baseTool from './baseTool.js';

export default class extends baseTool {
  constructor ({
    name,
    strategies,
    defaultStrategy,
    configuration,
    supportedInteractionTypes
  }) {
    super({
      name,
      strategies,
      defaultStrategy,
      configuration,
      supportedInteractionTypes
    });

    this.isAnnotationTool = true;
  }

  createNewMeasurement (evt) {
    throw new Error('Method createNewMeasurement not implemented in subclass.');
  }

  /**
   * @param {*} element
   * @param {*} data
   * @param {*} coords
   * @returns {boolean} If the point is near the tool
   */
  pointNearTool (element, data, coords) {
    throw new Error('Method pointNearTool not implemented in subclass.');
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
    throw new Error('Method distanceFromPoint not implemented in subclass.');
  }

  /**
   * Used to redraw the tool's annotation data per render
   *
   * @param {*} evt
   */
  renderToolData (evt) {
    throw new Error('Method renderToolData not implemented in subclass.');
  }

  /**
  * OPTIONAL -- Used to check if there is a valid target for the tool, that
  * isn't necessarily its own toolData. (e.g. the freehandSculpter)
  *
  * @param {*} evt
  * @returns {Boolean} - True if the target is manipulatable by the tool.
  *
  * isValidTarget (eventData) {}
  */

}
