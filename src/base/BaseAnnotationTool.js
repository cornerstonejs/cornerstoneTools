import BaseTool from './BaseTool.js';
// State
import { getToolState } from './../stateManagement/toolState.js';
// Manipulators
import handleActivator from './../manipulators/handleActivator.js';

import {
  moveHandleNearImagePoint,
  moveAnnotationNearClick
} from '../util/findAndMoveHelpers.js';


/**
 * @export @abstract @class
 * @name BaseAnnotationTool
 * @classdesc Abstract class for tools which create and display annotations on the
 * cornerstone canvas.
 * @extends BaseTool
 */
export default class BaseAnnotationTool extends BaseTool {
  constructor ({
    name,
    strategies,
    defaultStrategy,
    configuration,
    supportedInteractionTypes,
    mixins
  }) {
    super({
      name,
      strategies,
      defaultStrategy,
      configuration,
      supportedInteractionTypes,
      mixins
    });
  }

  // ===================================================================
  // Abstract Methods - Must be implemented.
  // ===================================================================

  /**
   * @abstract Creates a new annotation.
   *
   * @param  {type} evt description
   * @return {type}     description
   */
  createNewMeasurement (evt) {
    throw new Error(
      `Method createNewMeasurement not implemented for ${this.toolName}.`
    );
  }

  /**
   * @abstract @public Returns true if the given coords are need the tool.
   *
   * @param {*} element
   * @param {*} data
   * @param {*} coords
   * @returns {boolean} If the point is near the tool
   */
  pointNearTool (element, data, coords) {
    throw new Error(
      `Method pointNearTool not implemented for ${this.toolName}.`
    );
  }

  /**
   * @abstract  Returns the distance in px from the given coords to the
   *            closest handle of the annotation.
   *
   * @param {*} element
   * @param {*} data
   * @param {*} coords
   * @returns {number} the distance in px from the provided coordinates to the
   * closest rendered portion of the annotation. -1 if the distance cannot be
   * calculated.
   */
  distanceFromPoint (element, data, coords) {
    throw new Error(
      `Method distanceFromPoint not implemented for ${this.toolName}.`
    );
  }

  /**
   * @abstract Used to redraw the tool's annotation data per render
   *
   * @param {*} evt
   */
  renderToolData (evt) {
    throw new Error(`renderToolData not implemented for ${this.toolName}.`);
  }

  // ===================================================================
  // Virtual Methods - Have default behavior but may be overriden.
  // ===================================================================

  /**
   * Event handler for MOUSE_MOVE event.
   *
   * @virtual
   * @event
   * @param {Object} evt - The event.
   */
  mouseMoveCallback (evt) {
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
   *
   * @virtual
   * @param  {*} evt
   * @param  {*} handle The selected handle.
   */
  handleSelectedCallback (evt, handle, data) {
    moveHandleNearImagePoint(evt, handle, data, this.name);
  }

  /**
   * Custom callback for when a tool is selected.
   *
   * @virtual
   * @param  {*} evt
   * @param  {*} tool The selected tool.
   */
  toolSelectedCallback (evt, data, toolState) {
    const tool = this;

    moveAnnotationNearClick(evt, toolState, tool, data);
  }
}
