import { getToolState, addToolState } from '../stateManagement/toolState.js';
import BaseBrushTool from './../tools/base/BaseBrushTool.js';
import external from '../externalModules.js';

const referencedToolDataName = BaseBrushTool.getReferencedToolDataName();

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

  const brushStackState = getToolState(element, referencedToolDataName);

  if (!brushStackState.data.length) {
    return;
  }

  const stackState = getToolState(element, 'stack');
  const currentImageIdIndex = stackState.data[0].currentImageIdIndex;

  let invalidated = false;

  for (let i = 0; i < brushStackState.data.length; i++) {
    const brushStackData = brushStackState[i];
    const labelMap2D = brushStackData.labelMap2D[currentImageIdIndex];

    if (labelMap2D) {
      labelMap2D.invalidated = true;
      invalidated = true;
    }
  }

  if (invalidated) {
    // Refresh the canvas
    external.cornerstone.updateImage(eventData.element);
  }
}
