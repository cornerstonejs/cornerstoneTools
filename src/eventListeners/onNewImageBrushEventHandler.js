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

  const {
    labelmaps3D,
    currentImageIdIndex,
  } = brushModule.getters.labelMaps3DForElement(element);

  let invalidated = false;

  for (let i = 0; i < labelmaps3D.length; i++) {
    const labelmap2D = labelmaps3D[i].labelmaps2D[currentImageIdIndex];

    if (labelmap2D) {
      labelmap2D.invalidated = true;
      invalidated = true;
    }
  }

  if (invalidated) {
    // Refresh the canvas
    external.cornerstone.updateImage(eventData.element);
  }
}
