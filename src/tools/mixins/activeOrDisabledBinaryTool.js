import { setToolDisabledForElement, setToolEnabledForElement } from '../../store/setToolMode.js';

function passiveCallback (element) {
  console.warn(
    `Tools with the activeOrDisabledBinaryTool mixin may only be active or disabled, disabling ${this.name}.`
  );

  setToolDisabledForElement(element, this.name);
}

function enabledCallback (element) {
  console.warn(
    `Tools with the activeOrDisabledBinaryTool mixin may only be active or disabled, activating ${this.name}.`
  );

  setToolEnabledForElement(element, this.name);
}

export default {
  passiveCallback,
  activeCallback
};
