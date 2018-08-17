import store from './store/index.js';
import { addTool, addToolForElement } from './store/addTool.js';
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

export default function () {
  windowResizeHandler.enable();

  return Object.freeze({
    store,
    addTool,
    addToolForElement,
    addEnabledElement,
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
