import { getKey } from './keyCodes.js';


/**
 * Should be called by the class requesting the interface.
 * E.g. generateKeyInterface.call(this, keybinds).
 *
 * @param  {type} keyBinds the map of keybinds
 * @return {Object} keyboardInterface
 */
export function generateKeyInterface(keyBinds) {
  const keyboardInterface = {};
  Object.keys(keyBinds).forEach(key => {
    keyboardInterface[keyBinds[key]] = this[key].bind(this);
  });

  return keyboardInterface;
}

export class KeyInterface {
  constructor (tool, keyBinds) {
    this.interface = {};

    Object.keys(keyBinds).forEach(key => {
      this.interface[keyBinds[key]] = tool[key].bind(tool);
    });
  }
}

export default class {
  constructor(keyInterface) {
    Object.keys(keyInterface).forEach(key => {
      if (!(typeof keyInterface[key] === 'function')) {
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
    const keyInterface = this._keyInterface;

    let imageNeedsUpdate = false;

    Object.keys(keyInterface).forEach(key => {
      if (keyPressed === key) {
        keyInterface[key]();
        imageNeedsUpdate = true;
        return;
      }
    });

    return imageNeedsUpdate;
  }
}
