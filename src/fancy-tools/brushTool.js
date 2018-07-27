/* eslint no-loop-func: 0 */ // --> OFF
import external from './../externalModules.js';
import baseBrushTool from './../base/baseBrushTool.js';
import toolColors from './../stateManagement/toolColors.js';
// State
import { getToolState, addToolState } from './../stateManagement/toolState.js';

const cornerstone = external.cornerstone;

export default class extends baseBrushTool {
  constructor (name) {
    super({
      name: name || 'brush',
      supportedInteractionTypes: ['mouse'],
      configuration: defaultBrushConfiguration()
    });
  }



  /**
  * Event handler for MOUSE_MOVE event.
  *
  * @event
  * @param {Object} evt - The event.
  */
  mouseMoveCallback (evt) {
    throw new Error(`Method mouseMoveCallback not implemented for ${this.toolName}.`);
  }

  /**
  * Event handler for NEW_IMAGE event.
  *
  * @event
  * @param {Object} evt - The event.
  */
  onNewImageCallback(evt) {
    throw new Error(`Method onNewImageCallback not implemented for ${this.toolName}.`);
  }

  /**
  * Event handler for MOUSE_DRAG event.
  *
  * @event
  * @param {Object} evt - The event.
  */
  mouseDragCallback (evt) {
    throw new Error(`Method mouseDragCallback not implemented for ${this.toolName}.`);
  }

  /**
  * Event handler for MOUSE_DRAG event.
  *
  * @event
  * @param {Object} evt - The event.
  */
  mouseDownCallback (evt) {
    throw new Error(`Method mouseDownCallback not implemented for ${this.toolName}.`);
  }


  /**
   * renderBrush - called by the event dispatcher to render the image.
   *
   */
  renderBrush (evt) {
    throw new Error(`Method renderBrush not implemented for ${this.toolName}.`);
  }


}

function defaultBrushConfiguration () {
  return {
    draw: 1,
    radius: 3,
    hoverColor: toolColors.getToolColor(),
    dragColor: toolColors.getActiveColor()
  };
}
