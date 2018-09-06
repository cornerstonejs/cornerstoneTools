import store from '../store/index.js';
import { getToolState, addToolState } from '../stateManagement/toolState.js';
import baseBrushTool from '../base/baseBrushTool.js';
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
  let toolData = getToolState(element, baseBrushTool.getReferencedToolDataName());

  if (!toolData) { // Make toolData array as big as max number of segmentations.
    const maxSegmentations = baseBrushTool.getNumberOfColors();

    for (let i = 0; i < maxSegmentations; i++) {
      addToolState(element, baseBrushTool.getReferencedToolDataName(), {});
    }

    toolData = getToolState(element, baseBrushTool.getReferencedToolDataName());

    // TEMP: HACK: Create first pixel data such that the tool has some data and the brush
    // cursor can be rendered. Can be replaced once we have a mechanism for SVG cursors.
    const newPixelData = new Uint8ClampedArray(eventData.image.width * eventData.image.height);
    toolData.data[0].pixelData = newPixelData;

    toolData = getToolState(element, baseBrushTool.getReferencedToolDataName());
  }
  const enabledElement = external.cornerstone.getEnabledElement(element);
  const maxSegmentations = baseBrushTool.getNumberOfColors();

  // Clear the element's cache
  brushState.mutations.CLEAR_ELEMENT_IMAGE_BITMAP_CACHE(enabledElement.toolDataUID);

  // invalidate the segmentation bitmap such that it gets redrawn.
  for (let i = 0; i < maxSegmentations; i++) {
    toolData.data[i].invalidated = true;
  }

  // Refresh the canvas
  external.cornerstone.updateImage(eventData.element);
}
