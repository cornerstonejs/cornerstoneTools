import external from './externalModules.js';
import store from './store/index.js';
import { addTool, addToolForElement } from './store/addTool.js';
import getToolForElement from './store/getToolForElement.js';
import {
  setToolOptions,
  setToolOptionsForElement
} from './store/setToolOptions.js';
import addEnabledElement from './store/addEnabledElement.js';
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
  windowResizeHandler.enable();

  // Apply global configuration
  store.modules.globalConfiguration.state = Object.assign(
    {},
    store.modules.globalConfiguration.state,
    configuration
  );

  return Object.freeze({
    store,
    addTool,
    addToolForElement,
    getToolForElement,
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
}

function _addCornerstoneEventListeners () {
  const cornerstone = external.cornerstone;
  const elementEnabledEvent = cornerstone.EVENTS.ELEMENT_ENABLED;

  cornerstone.events.addEventListener(elementEnabledEvent, addEnabledElement);
}
