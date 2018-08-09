import EVENTS from './../events.js';
import mouseInput from './../inputSources/mouseInput.js';
import mouseToolEventDispatcher from './../eventDispatchers/mouseToolEventDispatcher.js';
import touchInput from './../inputSources/touchInput.js';
import touchToolEventDispatcher from './../eventDispatchers/touchToolEventDispatcher.js';
import keyboardInput from './../inputSources/keyboardInput.js';
import mouseWheelInput from './../inputSources/mouseWheelInput.js';
import onImageRendered from './../eventDispatchers/onImageRendered.js';
import onNewImage from './../eventDispatchers/onNewImage.js';

// TODO: Canvases are already tracked by `cornerstone`, but should we track them as well?
// TODO: This might be easier if `cornerstone` emitted events for enable/disable of canvases
// TODO: Then we could just respond to those events and not worry about tracking/lifecycle
export default function (canvas) {
  mouseInput.enable(canvas);
  mouseToolEventDispatcher.enable(canvas);
  touchInput.enable(canvas);
  touchToolEventDispatcher.enable(canvas);
  keyboardInput.enable(canvas);
  mouseWheelInput.enable(canvas);
  canvas.addEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);
  canvas.addEventListener(EVENTS.NEW_IMAGE, onNewImage);
}
