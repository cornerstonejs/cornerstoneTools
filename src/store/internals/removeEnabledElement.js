import {
  keyboardEventListeners,
  mouseEventListeners,
  mouseWheelEventListeners,
  touchEventListeners
} from '../../eventListeners/index.js';
import {
  imageRenderedEventDispatcher,
  mouseToolEventDispatcher,
  newImageEventDispatcher,
  touchToolEventDispatcher
} from '../../eventDispatchers/index.js';
import store from '../index.js';

export default function (elementDisabledEvt) {
  const enabledElement = elementDisabledEvt.detail.element;

  // Listeners
  keyboardEventListeners.disable(enabledElement);
  mouseEventListeners.disable(enabledElement);
  mouseWheelEventListeners.disable(enabledElement);

  // Dispatchers
  imageRenderedEventDispatcher.disable(enabledElement);
  mouseToolEventDispatcher.disable(enabledElement);
  newImageEventDispatcher.disable(enabledElement);

  if (store.modules.globalConfiguration.state.touchEnabled) {
    touchEventListeners.disable(enabledElement);
    touchToolEventDispatcher.disable(enabledElement);
  }

  // State
  store.mutations.REMOVE_ENABLED_ELEMENT(enabledElement);
}
