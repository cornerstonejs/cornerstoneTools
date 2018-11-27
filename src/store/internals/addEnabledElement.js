import {
  mouseEventListeners,
  wheelEventListener,
  touchEventListeners,
} from '../../eventListeners/index.js';
import {
  imageRenderedEventDispatcher,
  mouseToolEventDispatcher,
  newImageEventDispatcher,
  touchToolEventDispatcher,
} from '../../eventDispatchers/index.js';
import { addToolForElement } from './../addTool.js';
import {
  setToolActiveForElement,
  setToolPassiveForElement,
  setToolEnabledForElement,
  setToolDisabledForElement,
} from './../setToolMode.js';
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
 * @export
 * @private
 * @method
 * @name addEnabledElement
 * @param {Cornerstone#ElementEnabled} elementEnabledEvt
 * @listens Cornerstone#ElementEnabled
 */
export default function(elementEnabledEvt) {
  console.log('EVENT:ELEMENT_ENABLED');
  const enabledElement = elementEnabledEvt.detail.element;

  // Dispatchers
  imageRenderedEventDispatcher.enable(enabledElement);
  newImageEventDispatcher.enable(enabledElement);

  // Mouse
  if (store.modules.globalConfiguration.state.mouseEnabled) {
    mouseEventListeners.enable(enabledElement);
    wheelEventListener.enable(enabledElement);
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
 * @private
 * @method
 * @param {HTMLElement} enabledElement
 */
const _addEnabledElmenet = function(enabledElement) {
  store.state.enabledElements.push(enabledElement);
  if (store.modules) {
    _initModulesOnElement(enabledElement);
  }
  _addGlobalToolsToElement(enabledElement);
  _repeatGlobalToolHistory(enabledElement);
};

/**
 * Iterate over our store's modules. If the module has an `enabledElementCallback`
 * call it and pass it a reference to our enabled element.
 * @private
 * @method
 * @param  {Object} enabledElement
 */
function _initModulesOnElement(enabledElement) {
  const modules = store.modules;

  Object.keys(modules).forEach(function(key) {
    if (typeof modules[key].enabledElementCallback === 'function') {
      modules[key].enabledElementCallback(enabledElement);
    }
  });
}

function _addGlobalToolsToElement(enabledElement) {
  if (!store.modules.globalConfiguration.state.globalToolSyncEnabled) {
    return;
  }

  Object.keys(store.state.globalTools).forEach(function(key) {
    const { tool, configuration } = store.state.globalTools[key];

    addToolForElement(enabledElement, tool, configuration);
  });
}

function _repeatGlobalToolHistory(enabledElement) {
  if (!store.modules.globalConfiguration.state.globalToolSyncEnabled) {
    return;
  }

  const setToolModeFns = {
    active: setToolActiveForElement,
    passive: setToolPassiveForElement,
    enabled: setToolEnabledForElement,
    disabled: setToolDisabledForElement,
  };

  store.state.globalToolChangeHistory.forEach(historyEvent => {
    const args = historyEvent.args.slice(0);

    args.unshift(enabledElement);
    setToolModeFns[historyEvent.mode].apply(null, args);
  });
}
