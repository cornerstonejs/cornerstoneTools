import BaseTool from './BaseTool.js';
import { getToolState, removeToolState, deleteToolData } from './../../stateManagement/toolState.js';
import handleActivator from './../../manipulators/handleActivator.js';
import {
  moveHandleNearImagePoint,
  moveAnnotation,
} from './../../util/findAndMoveHelpers.js';
import { getLogger } from '../../util/logger';
import triggerEvent from '../../util/triggerEvent.js';
import { state } from '../../store/index.js';
import external from '../../externalModules.js';

const logger = getLogger('baseAnnotationTool');

/**
 * @memberof Tools.Base
 * @classdesc Abstract class for tools which create and display annotations on the
 * cornerstone canvas.
 * @extends Tools.Base.BaseTool
 */
class BaseAnnotationTool extends BaseTool {
  constructor(...args) {
    super(...args);
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
  // eslint-disable-next-line no-unused-vars
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
  // eslint-disable-next-line no-unused-vars
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
  // eslint-disable-next-line no-unused-vars
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
   * @returns {void}
   */
  // eslint-disable-next-line no-unused-vars
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
   * @returns {boolean} - True if the image needs to be updated
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
        this.pointNearTool(element, data, coords, 'mouse') && !data.active;
      const notNearToolAndMarkedActive =
        !this.pointNearTool(element, data, coords, 'mouse') && data.active;

      if (nearToolAndNotMarkedActive || notNearToolAndMarkedActive) {
        data.active = !data.active;
        imageNeedsUpdate = true;
      }
    }

    return imageNeedsUpdate;
  }
  /**
   * Event handler for KeyBoard event.
   *
   * @abstract
   * @event
   * @param {Object} evt - The event.
   * @returns {boolean} - True if the image needs to be updated
   */
  // keyboardCallBack(evt) {
  //   if (evt.detail.keyCode !== 8) { //delete key
  //     return
  //   } 
  //   const { element } = evt.detail;
  //   state.tools.forEach(function (tool) {
  //     const toolState = getToolState(element, tool.name);
  //     if (toolState) {
  //       for (let d = 0; d < toolState.data.length; d++) {
  //         const data = toolState.data[d];
  //         if (data.active) {
  //           removeToolState(element, tool.name, data);
  //           // Refresh the canvas
  //           external.cornerstone.updateImage(element);
  //         }
  //       }
  //     }
  //   })
  // }

  /**
   * Custom callback for when a handle is selected.
   * @method handleSelectedCallback
   * @memberof Tools.Base.BaseAnnotationTool
   *
   * @param  {*} evt    -
   * @param  {*} toolData   -
   * @param  {*} handle - The selected handle.
   * @param  {String} interactionType -
   * @returns {void}
   */
  handleSelectedCallback(evt, toolData, handle, interactionType = 'mouse') {
    moveHandleNearImagePoint(evt, this, toolData, handle, interactionType);
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
   * @returns {void}
   */
  toolSelectedCallback(evt, annotation, interactionType = 'mouse', toolName) {
    if (evt.detail.buttons === 1) { //鼠标左键
      moveAnnotation(evt, this, annotation, interactionType);
    } else if (evt.detail.buttons === 2) { //鼠标右键
      const { element } = evt.detail;
      const div = document.createElement('div');
      div.style.cssText = 'position: fixed; top: 0; left: 0; width:100%; height: 100%; z-index: 1000;';
      const ul = document.createElement('ul');
      ul.style.cssText = `position: absolute; top: ${evt.detail.event.clientY}px; left: ${evt.detail.event.clientX}px; padding: 0; margin: 0; list-style:none; width: 100px`
      const li = document.createElement('li');
      li.style.cssText = `cursor: pointer; height: 36px; background-color: #fff; text-align: center; line-height: 36px;`
      li.onmouseover = function () {
        this.style.background = '#c8d5f2';
      }
      li.onmouseleave = function () {
        this.style.background = '#fff';
      }
      li.textContent = '删除';
      ul.appendChild(li);
      div.appendChild(ul);
      document.body.appendChild(div);
      li.onclick = function (e) {
        if (toolName) {
          removeToolState(element, toolName, annotation); 
        } else {
          deleteToolData(evt);
        }
        external.cornerstone.updateImage(element);
        document.body.removeChild(div);
        e.stopPropagation();
      }
      div.onclick = function () {
        document.body.removeChild(div);
      }
      // triggerEvent(evt.detail.element, 'opencontextmenu', evt);
    }
  }

  /**
   * Updates cached statistics for the tool's annotation data on the element
   *
   * @param {*} image
   * @param {*} element
   * @param {*} data
   * @returns {void}
   */
  updateCachedStats(image, element, data) {
    logger.warn(`updateCachedStats not implemented for ${this.name}.`);
  }
}

export default BaseAnnotationTool;
