import { getToolState, addToolState } from '../stateManagement/toolState.js';
import BaseBrushTool from './../tools/base/BaseBrushTool.js';
import external from '../externalModules.js';

/**
 * Clears the brush imageBitmapCache,
 * invaldates the data and calls for a re-render.
 * @private
 * @param {Object} evt - The event.
 * @returns {void}
 */
export default function(evt) {
  const eventData = evt.detail;
  const element = eventData.element;

  let toolData = getToolState(
    element,
    BaseBrushTool.getReferencedToolDataName()
  );

  if (!toolData) {
    addToolState(element, BaseBrushTool.getReferencedToolDataName(), {});
    toolData = getToolState(element, BaseBrushTool.getReferencedToolDataName());
  }

  const maxSegmentations = BaseBrushTool.getNumberOfColors();

  // Invalidate the segmentation bitmap such that it gets redrawn.
  for (let i = 0; i < maxSegmentations; i++) {
    if (toolData.data[i]) {
      toolData.data[i].invalidated = true;
    }
  }

  // Refresh the canvas
  external.cornerstone.updateImage(eventData.element);
}
