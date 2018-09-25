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
import external from '../../externalModules.js';
import store from '../index.js';

// TODO: It would be nice if this automatically added "all tools"
// TODO: To the enabledElement that already exist on all other tools.
// TODO: A half-measure might be a new method to "duplicate" the tool
// TODO: Configuration for an existing enabled element
// TODO: We may need to also save/store the original class/constructor per tool
// TODO: To accomplish this
/**
 * Adds an enabledElement to our store.
 *
 * @export
 * @param {*} elementEnabledEvt
 */
export default function (elementEnabledEvt) {
  const enabledElement = elementEnabledEvt.detail.element;

  // Listeners
  keyboardEventListeners.enable(enabledElement);
  mouseEventListeners.enable(enabledElement);
  mouseWheelEventListeners.enable(enabledElement);

  // Dispatchers
  imageRenderedEventDispatcher.enable(enabledElement);
  mouseToolEventDispatcher.enable(enabledElement);
  newImageEventDispatcher.enable(enabledElement);

  if (store.modules.globalConfiguration.state.touchEnabled) {
    touchEventListeners.enable(enabledElement);
    touchToolEventDispatcher.enable(enabledElement);
  }

  // State
  _addEnabledElmenet(enabledElement);
}

const _addEnabledElmenet = function (enabledElement) {
  store.state.enabledElements.push(enabledElement);

  if (store.modules.brush) {
    store.modules.brush.setters.setElementVisible(enabledElement);
  }
};
