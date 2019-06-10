import external from '../externalModules.js';
import store from '../store/index.js';

const brushModule = store.modules.brush;

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

  const { labelmaps3D, currentImageIdIndex } = brushModule.getters.labelmaps3D(
    element
  );

  if (!labelmaps3D) {
    return;
  }

  let invalidated = false;

  for (let i = 0; i < labelmaps3D.length; i++) {
    const labelmap3D = labelmaps3D[i];

    if (!labelmap3D) {
      continue;
    }

    const labelmap2D = labelmap3D.labelmaps2D[currentImageIdIndex];

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
