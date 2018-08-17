import {
  keyboardEventListeners,
  mouseEventListeners,
  mouseWheelEventListeners,
  touchEventListeners
} from './../eventListeners/index.js';
import {
  imageRenderedEventDispatcher,
  mouseToolEventDispatcher,
  newImageEventDispatcher,
  touchToolEventDispatcher
} from './../eventDispatchers/index.js';
import { mutations } from './index.js';

// TODO: Canvases are already tracked by `cornerstone`, but should we track them as well?
// TODO: This might be easier if `cornerstone` emitted events for enable/disable of canvases
// TODO: Then we could just respond to those events and not worry about tracking/lifecycle
export default function (canvas) {
  // Listeners
  keyboardEventListeners.enable(canvas);
  mouseEventListeners.enable(canvas);
  mouseWheelEventListeners.enable(canvas);
  touchEventListeners.enable(canvas);

  // Dispatchers
  imageRenderedEventDispatcher.enable(canvas);
  mouseToolEventDispatcher.enable(canvas);
  newImageEventDispatcher.enable(canvas);
  touchToolEventDispatcher.enable(canvas);

  // State
  mutations.ADD_CANVAS(canvas);
}
