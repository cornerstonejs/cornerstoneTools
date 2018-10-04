import external from '../../externalModules.js';
import { freehand } from '../../imageTools/freehand.js';

/**
* Triggers held down buttons such that we can update the image on CTRL click
* to show all points, for example.
*/

/**
 * An enum containing textual representations of keyCodes.
 * @type {Object}
 */
const keyCodes = {
  SHIFT: 16,
  CTRL: 17,
  ALT: 18
};

/**
* Event handler for KEY_DOWN event.
*
* @param {Object} e - The event.
*/
export function keyDownCallback (e) {
  const eventData = e.detail;
  const config = freehand.getConfiguration();
  const keyCode = eventData.keyCode;
  let imageNeedsUpdate = false;

  if (keyCode === keyCodes.CTRL) {
    config.keyDown.ctrl = true;
    imageNeedsUpdate = true;
  }

  if(keyCode === keyCodes.SHIFT) {
    config.keyDown.shift = true;
  }

  if(keyCode === keyCodes.ALT) {
    config.keyDown.alt = true;
  }

  if (imageNeedsUpdate) {
    // Force onImageRendered to fire
    external.cornerstone.updateImage(eventData.element);
  }
}

/**
* Event handler for KEY_UP event.
*
* @param {Object} e - The event.
*/
export function keyUpCallback (e) {
  const eventData = e.detail;
  const config = freehand.getConfiguration();
  const keyCode = eventData.keyCode;
  let imageNeedsUpdate = false;

  if (keyCode === keyCodes.CTRL) {
    config.keyDown.ctrl = false;
    imageNeedsUpdate = true;
  }

  if(keyCode === keyCodes.SHIFT) {
    config.keyDown.shift = false;
  }

  if(keyCode === keyCodes.ALT) {
    config.keyDown.alt = false;
  }

  if (imageNeedsUpdate) {
    // Force onImageRendered to fire
    external.cornerstone.updateImage(eventData.element);
  }
}
