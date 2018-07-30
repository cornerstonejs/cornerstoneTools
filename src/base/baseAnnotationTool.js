import baseTool from './baseTool.js';
import { getToolState } from '../stateManagement/toolState.js';
import handleActivator from '../manipulators/handleActivator.js';

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
    throw new Error(`Method createNewMeasurement not implemented for ${this.toolName}.`);
  }

  /**
   * @param {*} element
   * @param {*} data
   * @param {*} coords
   * @returns {boolean} If the point is near the tool
   */
  pointNearTool (element, data, coords) {
    throw new Error(`Method pointNearTool not implemented for ${this.toolName}.`);
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
    throw new Error(`Method distanceFromPoint not implemented for ${this.toolName}.`);
  }

  /**
   * Used to redraw the tool's annotation data per render
   *
   * @param {*} evt
   */
  renderToolData (evt) {
    throw new Error(`renderToolData not implemented for ${this.toolName}.`);
  }

  /**
   * Used to handle mouseMove events triggered by the eventDispatcher
   *
   * @param {*} evt
   * @return {boolean} whether the canvas needs to be re-rendered.
   */
  handleMouseMove(evt) {
    const { element, currentPoints } = evt.detail;
    const coords = currentPoints.canvas;
    const toolState = getToolState(element, this.name);
    let imageNeedsUpdate = false;

    for (let d = 0; d < toolState.data.length; d++) {
      const data = toolState.data[d];

      // Hovering a handle?
      if (handleActivator(element, data.handles, coords) === true) {
        imageNeedsUpdate = true;
      }

      // Tool data's 'active' does not match coordinates
      // TODO: can't we just do an if/else and save on a pointNearTool check?
      const nearToolAndNotMarkedActive =
        this.pointNearTool(element, data, coords) && !data.active;
      const notNearToolAndMarkedActive =
        !this.pointNearTool(element, data, coords) && data.active;

      if (nearToolAndNotMarkedActive || notNearToolAndMarkedActive) {
        data.active = !data.active;
        imageNeedsUpdate = true;
      }

      // Call the tool's mouseMoveCallback if it exists.
      if (typeof this.mouseMoveCallback === 'function') {
        this.mouseMoveCallback(evt);
      }

    }

    return imageNeedsUpdate;
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
