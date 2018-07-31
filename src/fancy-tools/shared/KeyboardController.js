import { getKey } from './keyCodes.js';

export default class {
  constructor(tool, keyBinds) {
    const keyInterface = this._generateKeyInterface(tool, keyBinds);

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

  _generateKeyInterface (tool, keyBinds) {
    const keyInterface = {};

    Object.keys(keyBinds).forEach(key => {
      keyInterface[keyBinds[key]] = tool[key].bind(tool);
    });

    return keyInterface;
  }
}
