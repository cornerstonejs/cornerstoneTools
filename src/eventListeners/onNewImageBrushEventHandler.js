import store from '../store/index.js';
import { getToolState, addToolState } from '../stateManagement/toolState.js';
import external from '../externalModules.js';
import getToolForElement from '../store/getToolForElement.js';

const brushState = store.modules.brush;

/**
* Clears the brush imageBitmapCache,
* invaldates the data and calls for a re-render.
* @event
* @param {Object} evt - The event.
*/
export default function (evt) {
  const eventData = evt.detail;
  const element = eventData.element;
  let toolData = getToolState(element, 'brush');
  const brushTool = getToolForElement(element, '')

  if (!toolData) {
    const pixelData = new Uint8ClampedArray(eventData.image.width * eventData.image.height);

    addToolState(element, 'brush', { pixelData });
    toolData = getToolState(element, 'brush');
  }

    const enabledElement = external.cornerstone.getEnabledElement(element);

  // Clear the element's cache
  brushState.mutations.SET_ELEMENT_IMAGE_BITMAP_CACHE(enabledElement.toolDataUID, null);

  external.cornerstone.updateImage(eventData.element);
}
