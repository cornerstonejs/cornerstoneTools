import { getToolState, addToolState } from '../stateManagement/toolState.js';
import BaseBrushTool from './../tools/base/BaseBrushTool.js';
import external from '../externalModules.js';
import store from '../store/index.js';

const brushModule = store.modules.brush;

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

  const { brushStackState, currentImageIdIndex } = brushModule.getters.labelmap(
    element
  );

  let invalidated = false;

  const labelMap2D = brushStackState.labelMap2D[currentImageIdIndex];

  if (labelMap2D) {
    labelMap2D.invalidated = true;
    invalidated = true;
  }

  if (invalidated) {
    // Refresh the canvas
    external.cornerstone.updateImage(eventData.element);
  }
}
