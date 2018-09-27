import external from './externalModules.js';
import store from './store/index.js';
import registerModule from './store/registerModule.js';
import { addTool, addToolForElement } from './store/addTool.js';
import { removeTool, removeToolForElement } from './store/removeTool.js';
import getToolForElement from './store/getToolForElement.js';
import {
  setToolOptions,
  setToolOptionsForElement
} from './store/setToolOptions.js';
import addEnabledElement from './store/internals/addEnabledElement.js';
import removeEnabledElement from './store/internals/removeEnabledElement.js';
import {
  setToolActive,
  setToolActiveForElement,
  setToolEnabled,
  setToolEnabledForElement,
  setToolDisabled,
  setToolDisabledForElement,
  setToolPassive,
  setToolPassiveForElement
} from './store/setToolMode.js';
import windowResizeHandler from './eventListeners/windowResizeHandler.js';

export default function (configuration) {
  _addCornerstoneEventListeners();
  _initModules();
  windowResizeHandler.enable();

  // Apply global configuration
  store.modules.globalConfiguration.state = Object.assign(
    {},
    store.modules.globalConfiguration.state,
    configuration
  );

  const cornerstoneToolsInstance = Object.freeze({
    store,
    addTool,
    addToolForElement,
    getToolForElement,
    removeTool,
    removeToolForElement,
    setToolOptions,
    setToolOptionsForElement,
    // Tool Modes
    setToolActive,
    setToolActiveForElement,
    setToolEnabled,
    setToolEnabledForElement,
    setToolDisabled,
    setToolDisabledForElement,
    setToolPassive,
    setToolPassiveForElement
  });

  // By assigning this here it is only accessible by initialised instances,
  // This prevents users of the library from trying to register modules before
  // Initialising cornerstoneTools.
  cornerstoneToolsInstance.store.registerModule = registerModule;

  return cornerstoneToolsInstance;
}

function _addCornerstoneEventListeners () {
  const cornerstone = external.cornerstone;
  const elementEnabledEvent = cornerstone.EVENTS.ELEMENT_ENABLED;
  const elementDisabledEvent = cornerstone.EVENTS.ELEMENT_DISABLED;

  cornerstone.events.addEventListener(elementEnabledEvent, addEnabledElement);
  cornerstone.events.addEventListener(
    elementDisabledEvent,
    removeEnabledElement
  );
}

/**
 * _initModules - Initialise all modules that have an onRegisterCallback.
 * TODO: Makes sure 3rd party modules get
 * Registered before we try to init them.
 *
 * @private
 * @param  {Object} enabledElement  The element on which to
 *                                  Initialise the modules.
 */
function _initModules () {
  const modules = store.modules;

  Object.keys(modules).forEach(function(key) {
    if (typeof modules[key].onRegisterCallback === 'function') {
      modules[key].onRegisterCallback();
    }
  });
}
