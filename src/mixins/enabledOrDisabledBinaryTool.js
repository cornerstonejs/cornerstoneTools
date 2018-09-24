import { setToolDisabledForElement, setToolEnabledForElement } from '../store/setToolMode.js';

/**
 * If one attempts to change mode to 'passive', redirect the tool to 'disabled'.
 *
 * @param  {type} element The element on which the tool resides.
 */
function passiveCallback (element) {
  setToolDisabledForElement(element, this.name);
}

/**
 * If one attempts to change mode to 'active', redirect the tool to 'enabled'.
 *
 * @param  {type} element The element on which the tool resides.
 */
function activeCallback (element) {
  setToolEnabledForElement(element, this.name);
}

export default {
  passiveCallback,
  activeCallback
};
