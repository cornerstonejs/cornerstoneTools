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

/**
 * Removes an enabledElement from our store, and all associated tools that were added to it.
 *
 * @export
 * @param {*} elementDisabledEvt
 */
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
  _removeAllToolsForElement(enabledElement);
  _removeEnabledElement(enabledElement);
}

const _removeAllToolsForElement = function (enabledElement) {
  store.state.tools = store.state.tools.filter(
    (tool) => tool.element === enabledElement
  );
};

const _removeEnabledElement = function (enabledElement) {
  const foundElementIndex = store.state.enabledElements.findIndex(
    (element) => element === enabledElement
  );

  if (foundElementIndex) {
    store.state.enabledElements.splice(foundElementIndex, 1);
  }
};
