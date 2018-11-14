import BaseTool from './BaseTool.js';
import { getToolState } from './../../stateManagement/toolState.js';
import handleActivator from './../../manipulators/handleActivator.js';
import {
  moveHandleNearImagePoint,
  moveAnnotation,
} from './../../util/findAndMoveHelpers.js';

/**
 * @memberof Tools.Base
 * @classdesc Abstract class for tools which create and display annotations on the
 * cornerstone canvas.
 * @extends Tools.Base.BaseTool
 */
class BaseAnnotationTool extends BaseTool {
  constructor({
    name,
    strategies,
    defaultStrategy,
    configuration,
    supportedInteractionTypes,
    mixins,
  }) {
    super({
      name,
      strategies,
      defaultStrategy,
      configuration,
      supportedInteractionTypes,
      mixins,
    });
  }

  // ===================================================================
  // Abstract Methods - Must be implemented.
  // ===================================================================

  /**
   * Creates a new annotation.
   *
   * @method createNewMeasurement
   * @memberof Tools.Base.BaseAnnotationTool
   *
   * @param  {type} evt description
   * @returns {type}     description
   */
  createNewMeasurement(evt) {
    throw new Error(
      `Method createNewMeasurement not implemented for ${this.name}.`
    );
  }

  /**
   *
   * Returns true if the given coords are need the tool.
   *
   * @method pointNearTool
   * @memberof Tools.Base.BaseAnnotationTool
   *
   * @param {*} element
   * @param {*} data
   * @param {*} coords
   * @param {string} [interactionType=mouse]
   * @returns {boolean} If the point is near the tool
   */
  pointNearTool(element, data, coords, interactionType = 'mouse') {
    throw new Error(`Method pointNearTool not implemented for ${this.name}.`);
  }

  /**
   * Returns the distance in px from the given coords to the closest handle of the annotation.
   *
   * @method distanceFromPoint
   * @memberof Tools.Base.BaseAnnotationTool
   *
   * @param {*} element
   * @param {*} data
   * @param {*} coords
   * @returns {number} -  the distance in px from the provided coordinates to the
   * closest rendered portion of the annotation. -1 if the distance cannot be
   * calculated.
   */
  distanceFromPoint(element, data, coords) {
    throw new Error(
      `Method distanceFromPoint not implemented for ${this.name}.`
    );
  }

  /**
   * Used to redraw the tool's annotation data per render
   *
   * @abstract
   * @param {*} evt
   */
  renderToolData(evt) {
    throw new Error(`renderToolData not implemented for ${this.name}.`);
  }

  // ===================================================================
  // Virtual Methods - Have default behavior but may be overriden.
  // ===================================================================

  /**
   * Event handler for MOUSE_MOVE event.
   *
   * @abstract
   * @event
   * @param {Object} evt - The event.
   */
  mouseMoveCallback(evt) {
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
    }

    return imageNeedsUpdate;
  }

  /**
   * Custom callback for when a handle is selected.
   * @method handleSelectedCallback
   * @memberof Tools.Base.BaseAnnotationTool
   *
   * @param  {*} evt    -
   * @param  {*} toolData   -
   * @param  {*} handle - The selected handle.
   * @param  {String} interactionType -
   * @returns {undefined}
   */
  handleSelectedCallback(evt, toolData, handle, interactionType = 'mouse') {
    moveHandleNearImagePoint(evt, this.name, toolData, handle, interactionType);
  }

  /**
   * Custom callback for when a tool is selected.
   *
   * @method toolSelectedCallback
   * @memberof Tools.Base.BaseAnnotationTool
   *
   * @param  {*} evt
   * @param  {*} annotation
   * @param  {string} [interactionType=mouse]
   * @returns {undefined}
   */
  toolSelectedCallback(evt, annotation, interactionType = 'mouse') {
    moveAnnotation(evt, this, annotation, interactionType);
  }
}

export default BaseAnnotationTool;
