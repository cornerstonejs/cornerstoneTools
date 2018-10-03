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
 * Element Enabled event.
 *
 * @event Cornerstone#ElementEnabled
 * @type {Object}
 * @property {string} type
 * @property {Object} detail
 * @property {HTMLElement} detail.element - The element being enabled.
 */

/* TODO: It would be nice if this automatically added "all tools"
 * To the enabledElement that already exist on all other tools.
 * A half-measure might be a new method to "duplicate" the tool
 * Configuration for an existing enabled element
 * We may need to also save/store the original class/constructor per tool
 * To accomplish this
 */
/**
 * Adds an enabledElement to our store.
 * @export @private @method
 * @name addEnabledElement
 * @param {Cornerstone#ElementEnabled} elementEnabledEvt
 * @listens Cornerstone#ElementEnabled
 */
export default function (elementEnabledEvt) {
  const enabledElement = elementEnabledEvt.detail.element;

  // Dispatchers
  imageRenderedEventDispatcher.enable(enabledElement);
  newImageEventDispatcher.enable(enabledElement);

  // Mouse
  if (store.modules.globalConfiguration.state.mouseEnabled) {
    mouseEventListeners.enable(enabledElement);
    mouseWheelEventListeners.enable(enabledElement);
    mouseToolEventDispatcher.enable(enabledElement);
  }

  // Touch
  if (store.modules.globalConfiguration.state.touchEnabled) {
    touchEventListeners.enable(enabledElement);
    touchToolEventDispatcher.enable(enabledElement);
  }

  // State
  _addEnabledElmenet(enabledElement);
}

/**
 * Adds the enabled element to the store.
 * @private @method
 * @param {HTMLElement} enabledElement
 */
const _addEnabledElmenet = function (enabledElement) {
  store.state.enabledElements.push(enabledElement);
  if (store.modules) {
    _initModulesOnElement(enabledElement);
  }
};

/**
 * Iterate over our store's modules. If the module has an `enabledElementCallback`
 * call it and pass it a reference to our enabled element.
 * @private @method
 * @param  {Object} enabledElement
 */
function _initModulesOnElement (enabledElement) {
  const modules = store.modules;

  Object.keys(modules).forEach(function (key) {
    if (typeof modules[key].enabledElementCallback === 'function') {
      modules[key].enabledElementCallback(enabledElement);
    }
  });
}
