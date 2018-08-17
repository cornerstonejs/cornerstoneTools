import store from './store/index.js';
import { addTool, addToolGlobal } from './store/addTool.js';
import addCanvas from './store/addCanvas.js';
import {
  setToolActive,
  setToolActiveGlobal,
  setToolEnabled,
  setToolEnabledGlobal,
  setToolDisabled,
  setToolDisabledGlobal,
  setToolPassive,
  setToolPassiveGlobal
} from './store/setToolMode.js';

export default function () {
  return Object.freeze({
    store,
    addTool,
    addToolGlobal,
    addCanvas,
    // Tool Modes
    setToolActive,
    setToolActiveGlobal,
    setToolEnabled,
    setToolEnabledGlobal,
    setToolDisabled,
    setToolDisabledGlobal,
    setToolPassive,
    setToolPassiveGlobal
  });
}
