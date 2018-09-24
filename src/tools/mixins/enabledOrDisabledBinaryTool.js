import { setToolDisabledForElement, setToolEnabledForElement } from '../../store/setToolMode.js';

function passiveCallback (element) {
  console.warn(
    `Tools with the enabledOrDisabledBinaryTool mixin may only be enabled or disabled, disabling ${this.name}.`
  );

  setToolDisabledForElement(element, this.name);
}

function activeCallback (element) {
  console.warn(
    `Tools with the enabledOrDisabledBinaryTool mixin may only be enabled or disabled, enabling ${this.name}.`
  );

  setToolEnabledForElement(element, this.name);
}

export default {
  passiveCallback,
  activeCallback
};
