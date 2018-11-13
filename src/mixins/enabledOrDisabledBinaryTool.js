import {
  setToolDisabledForElement,
  setToolEnabledForElement,
} from '../store/setToolMode.js';

/**
 * If one attempts to change mode to 'passive', redirect the tool to 'disabled'.
 *
 * @param {HTMLElement} element The element on which the tool resides.
 * @returns {undefined}
 */
function passiveCallback(element) {
  setToolDisabledForElement(element, this.name);
}

/**
 * If one attempts to change mode to 'active', redirect the tool to 'enabled'.
 *
 * @param {HTMLElement} element The element on which the tool resides.
 * @returns {undefined}
 */
function activeCallback(element) {
  setToolEnabledForElement(element, this.name);
}

/**
 *
 * @mixin enabledOrDisabledBinaryTool - Redirect active/passive mode changes to enabled/disabled.
 * @memberof Mixins
 */
export default {
  passiveCallback,
  activeCallback,
};
