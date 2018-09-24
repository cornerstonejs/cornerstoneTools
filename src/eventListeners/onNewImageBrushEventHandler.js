import store from '../store/index.js';
import { getToolState, addToolState } from '../stateManagement/toolState.js';
import BaseBrushTool from '../base/BaseBrushTool.js';
import external from '../externalModules.js';

const { setters } = store.modules.brush;

/**
 * Clears the brush imageBitmapCache,
 * invaldates the data and calls for a re-render.
 * @event
 * @param {Object} evt - The event.
 */
export default function (evt) {
  const eventData = evt.detail;
  const element = eventData.element;
  let toolData = getToolState(
    element,
    BaseBrushTool.getReferencedToolDataName()
  );

  if (!toolData) {
    // Make toolData array as big as max number of segmentations.
    const maxSegmentations = BaseBrushTool.getNumberOfColors();

    for (let i = 0; i < maxSegmentations; i++) {
      addToolState(element, BaseBrushTool.getReferencedToolDataName(), {});
    }

    toolData = getToolState(element, BaseBrushTool.getReferencedToolDataName());

    // TEMP: HACK: Create first pixel data such that the tool has some data and the brush
    // Cursor can be rendered. Can be replaced once we have a mechanism for SVG cursors.
    const newPixelData = new Uint8ClampedArray(
      eventData.image.width * eventData.image.height
    );

    toolData.data[0].pixelData = newPixelData;

    toolData = getToolState(element, BaseBrushTool.getReferencedToolDataName());
  }
  const enabledElement = external.cornerstone.getEnabledElement(element);
  const maxSegmentations = BaseBrushTool.getNumberOfColors();

  // Clear the element's cache
  setters.clearImageBitmapCacheForElement(enabledElement.uuid);

  // Invalidate the segmentation bitmap such that it gets redrawn.
  for (let i = 0; i < maxSegmentations; i++) {
    toolData.data[i].invalidated = true;
  }

  // Refresh the canvas
  external.cornerstone.updateImage(eventData.element);
}
