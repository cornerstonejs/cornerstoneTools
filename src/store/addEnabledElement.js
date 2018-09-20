import {
  keyboardEventListeners,
  mouseEventListeners,
  mouseWheelEventListeners,
  touchEventListeners
} from '../eventListeners/index.js';
import {
  imageRenderedEventDispatcher,
  mouseToolEventDispatcher,
  newImageEventDispatcher,
  touchToolEventDispatcher,
  keyboardEventDispatcher
} from '../eventDispatchers/index.js';
import { mutations } from './index.js';
import generateGUID from './generateGUID.js';
import external from '../externalModules';

// TODO: Canvases are already tracked by `cornerstone`, but should we track them as well?
// TODO: This might be easier if `cornerstone` emitted events for enable/disable of canvases
// TODO: Then we could just respond to those events and not worry about tracking/lifecycle
export default function (enabledElement) {

  // TEMP -> We are piggy-backing off Cornerstone here, UUID
  // Generation should go core later, this is more of a POC.
  // NOTE: the 'enabledElement' argument here is actually the DOM element...
  const cornerstoneEnabledElement = external.cornerstone.getEnabledElement(enabledElement);

  // TEMP
  if (cornerstoneEnabledElement.uuid) {
    console.error('uuid has gone core! remove this block and the generateGUID function.');
  } else {
    cornerstoneEnabledElement.uuid = generateGUID();
  }
  // TEMP

  // Listeners
  keyboardEventListeners.enable(enabledElement);
  mouseEventListeners.enable(enabledElement);
  mouseWheelEventListeners.enable(enabledElement);
  touchEventListeners.enable(enabledElement);

  // Dispatchers
  imageRenderedEventDispatcher.enable(enabledElement);
  mouseToolEventDispatcher.enable(enabledElement);
  newImageEventDispatcher.enable(enabledElement);
  touchToolEventDispatcher.enable(enabledElement);
  keyboardEventDispatcher.enable(enabledElement);

  // State
  mutations.ADD_ENABLED_ELEMENT(enabledElement);
}
