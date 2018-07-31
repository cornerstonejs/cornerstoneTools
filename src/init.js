import store from './store/index.js';
import addTool from './store/addTool.js';
import addCanvas from './store/addCanvas.js';
import {
  setToolActive,
  setToolEnabled,
  setToolDisabled,
  setToolPassive
} from './store/setToolMode.js';

export default function () {
  return Object.freeze({
    store,
    addTool,
    addCanvas,
    // Tool Modes
    setToolActive,
    setToolEnabled,
    setToolDisabled,
    setToolPassive
  });
}
