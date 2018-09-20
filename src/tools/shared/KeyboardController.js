import { getKey } from './keyCodes.js';

export default class {
  constructor (tool, keyBinds) {

    if (this.constructor._containsInvalidKeybind(keyBinds)) {
      throw new Error(
        'Illegal binding, modifier keys are reserved for modifying mouse input.'
      );
    }

    const keyInterface = this.constructor._generateKeyInterface(tool, keyBinds);

    Object.keys(keyInterface).forEach((key) => {
      if (typeof keyInterface[key] !== 'function') {
        throw new Error(`Element ${key} of the keyInterface is not a function`);
      }
    });

    this._keyInterface = keyInterface;
  }

  /**
   * Calls the function mapped to the keypress
   *
   * @param  {Number} keyCode description
   * @return {Boolean} Whether a function was called.
   */
  keyPress (keyCode) {
    const keyPressed = getKey(keyCode);

    if (keyPressed === undefined) {
      throw new Error(`keyCode ${keyCode} is not valid mapping`);
    }

    const keyInterface = this._keyInterface;

    let imageNeedsUpdate = false;

    Object.keys(keyInterface).some((key) => {
      if (keyPressed === key) {
        keyInterface[key]();
        imageNeedsUpdate = true;

        return true;
      }
    });

    return imageNeedsUpdate;
  }

  /**
   * Returns true if modifier keys are contained in the keyBinds.
   *
   * @static
   * @private
   * @param  {Object} keyBinds Object defining the keybinds.
   * @return {Boolean}
   */
  static _containsInvalidKeybind (keyBinds) {
    let invalidKeybind = false;

    Object.keys(keyBinds).forEach((key) => {
      if (keyBinds[key] === 'CTRL' ||
        keyBinds[key] === 'SHIFT' ||
        keyBinds[key] === 'META' ||
        keyBinds[key] === 'ALT') {
        invalidKeybind = true;
      }
    });

    return invalidKeybind;
  }

  /**
   * Generates the keyInterface used by the controller.
   *
   * @static
   * @private
   * @param  {Object} tool     Reference to the tool instance.
   * @param  {Object} keyBinds Object defining the keybinds.
   * @return {Object}          The generated keyInterface.
   */
  static _generateKeyInterface (tool, keyBinds) {
    const keyInterface = {};

    Object.keys(keyBinds).forEach((key) => {
      keyInterface[keyBinds[key]] = tool[key].bind(tool);
    });

    return keyInterface;
  }
}
