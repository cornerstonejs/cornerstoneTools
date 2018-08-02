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
  }

  //===================================================================
  // Abstract Methods - Must be implemented.
  //===================================================================

  /**
   * @abstract Creates a new annotation.
   *
   * @param  {type} evt description
   * @return {type}     description
   */
  createNewMeasurement (evt) {
    throw new Error(`Method createNewMeasurement not implemented for ${this.toolName}.`);
  }

  /**
   * @abstract
   *
   * @param {*} element
   * @param {*} data
   * @param {*} coords
   * @returns {boolean} If the point is near the tool
   */
  pointNearTool (element, data, coords) {
    throw new Error(`Method pointNearTool not implemented for ${this.toolName}.`);
  }

  /**
   * @abstract
   *
   * @param {*} element
   * @param {*} data
   * @param {*} coords
   * @returns {number} the distance in px from the provided coordinates to the
   * closest rendered portion of the annotation. -1 if the distance cannot be
   * calculated.
   */
  distanceFromPoint (element, data, coords) {
    throw new Error(`Method distanceFromPoint not implemented for ${this.toolName}.`);
  }

  /**
   * @abstract Used to redraw the tool's annotation data per render
   *
   * @param {*} evt
   */
  renderToolData (evt) {
    throw new Error(`renderToolData not implemented for ${this.toolName}.`);
  }

  //===================================================================
  // Optional Methods - Used to override default behavior.
  //===================================================================

  /**
   * Custom callback for when a handle is selected.
   *
   * @param  {*} evt
   * @param  {*} handle The selected handle.
   */
  /*
  handleSelectedCallback (evt, handle) {
    // Implementation
  }
  */

  /**
   * Custom callback for when a tool is selected.
   *
   * @param  {*} evt
   * @param  {*} tool The selected tool.
   */
  /*
  toolSelectedCallback (evt, tool) {
    // Implementation
  }
  */

}
