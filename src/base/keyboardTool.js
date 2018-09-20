import BaseTool from './BaseTool.js';
// State
import { getToolState } from './../stateManagement/toolState.js';
// Manipulators
import handleActivator from './../manipulators/handleActivator.js';

import {
  moveHandleNearImagePoint,
  moveAnnotationNearClick
} from '../util/findAndMoveHelpers.js';

export default class KeyboardTool extends BaseTool {
  constructor ({
    name,
    strategies,
    defaultStrategy,
    configuration
  }) {
    super({
      name,
      strategies,
      defaultStrategy,
      configuration,
      supportedInteractionTypes: 'keyboard' // Or something!
    });
  }

  // ===================================================================
  // Abstract Methods - Must be implemented.
  // ===================================================================

  /**
  * Event handler for the keypress.
  *
  * @abstract
  * @param {Object} evt - The event.
  */
  onKeyDown(evt) {
    throw new Error(`Method onKeyDown not implemented for ${this.toolName}.`);
  }

}
