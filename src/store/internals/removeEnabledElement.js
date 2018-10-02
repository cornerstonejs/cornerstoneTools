import {
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
 * Element Disabled event.
 *
 * @event Cornerstone#ElementDisabled
 * @type {Object}
 * @property {string} type
 * @property {Object} detail
 * @property {HTMLElement} detail.element - The element being disabled.
 */

/**
 * Removes an enabledElement from our store, and all associated tools that were added to it.
 * @export @private @method
 * @name removeEnabledElement
 * @param {Cornerstone#ElementDisabled} elementDisabledEvt
 * @listens Cornerstone#ElementDisabled
 */
export default function (elementDisabledEvt) {
  const enabledElement = elementDisabledEvt.detail.element;

  // Dispatchers
  imageRenderedEventDispatcher.disable(enabledElement);
  newImageEventDispatcher.disable(enabledElement);

  // Mouse
  if (store.modules.globalConfiguration.state.mouseEnabled) {
    mouseEventListeners.disable(enabledElement);
    mouseWheelEventListeners.disable(enabledElement);
    mouseToolEventDispatcher.disable(enabledElement);
  }

  // Touch
  if (store.modules.globalConfiguration.state.touchEnabled) {
    touchEventListeners.disable(enabledElement);
    touchToolEventDispatcher.disable(enabledElement);
  }

  // State
  _removeAllToolsForElement(enabledElement);
  _removeEnabledElement(enabledElement);
}

/**
 * Remove all tools associated with enabled element.
 * @private @method
 * @param {HTMLElement} enabledElement
 */
const _removeAllToolsForElement = function (enabledElement) {
  // Note: We may want to `setToolDisabled` before removing from store
  // Or take other action to remove any lingering eventListeners/state
  store.state.tools = store.state.tools.filter(
    (tool) => tool.element === enabledElement
  );
};

/**
 * Remove the enabled element from the store if it exists.
 * @private @method
 * @param {HTMLElement} enabledElement
 */
const _removeEnabledElement = function (enabledElement) {
  const foundElementIndex = store.state.enabledElements.findIndex(
    (element) => element === enabledElement
  );

  if (foundElementIndex) {
    store.state.enabledElements.splice(foundElementIndex, 1);
  }
};
