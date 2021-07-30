import { getModule } from '../store/index.js';
import renderSegmentation from './internals/renderSegmentation.js';

const segmentationModule = getModule('segmentation');

/**
 * Finds which segmentations need to be rendered based on the configuration and
 * presence of `Labelmap2D` data on these frames.
 *
 * @param {Object} evt - The cornerstone event.
 * @returns {null}
 */
export default function(evt) {
  const eventData = evt.detail;
  const element = eventData.element;
  const { configuration, getters } = segmentationModule;

  const {
    activeLabelmapIndex,
    labelmaps3D,
    currentImageIdIndex,
  } = getters.labelmaps3D(element);

  if (!labelmaps3D) {
    return;
  }

  if (configuration.shouldRenderInactiveLabelmaps) {
    renderInactiveLabelMaps(
      evt,
      labelmaps3D,
      activeLabelmapIndex,
      currentImageIdIndex
    );
  }

  renderActiveLabelMap(
    evt,
    labelmaps3D,
    activeLabelmapIndex,
    currentImageIdIndex
  );
}

/**
 * RenderActiveLabelMap - Renders the `Labelmap3D` for this element if a `Labelmap2D`
 *                        view of the `currentImageIdIndex` exists.
 *
 * @param  {Object} evt                 The cornerstone event.
 * @param  {Labelmap3D[]} labelmaps3D       An array of `Labelmap3D` objects.
 * @param  {number} activeLabelmapIndex The index of the active label map.
 * @param  {number} currentImageIdIndex The in-stack image position.
 * @returns {null}
 */
function renderActiveLabelMap(
  evt,
  labelmaps3D,
  activeLabelmapIndex,
  currentImageIdIndex
) {
  const labelmap3D = labelmaps3D[activeLabelmapIndex];

  if (!labelmap3D) {
    return;
  }

  const labelmap2D = labelmap3D.labelmaps2D[currentImageIdIndex];

  if (labelmap2D) {
    renderSegmentation(evt, labelmap3D, activeLabelmapIndex, labelmap2D, true);
  }
}

/**
 * RenderInactiveLabelMaps - Renders all the inactive `Labelmap3D`s for this element.
 *
 * @param  {Object} evt                 The cornerstone event.
 * @param  {Labelmap3D[]} labelmaps3D       An array of labelmaps.
 * @param  {number} activeLabelmapIndex The index of the active label map.
 * @param  {number} currentImageIdIndex The in-stack image position.
 * @returns {null}
 */
function renderInactiveLabelMaps(
  evt,
  labelmaps3D,
  activeLabelmapIndex,
  currentImageIdIndex
) {
  for (let i = 0; i < labelmaps3D.length; i++) {
    const labelmap3D = labelmaps3D[i];

    if (i === activeLabelmapIndex || !labelmap3D) {
      continue;
    }

    const labelmap2D = labelmap3D.labelmaps2D[currentImageIdIndex];

    if (labelmap2D) {
      renderSegmentation(evt, labelmap3D, i, labelmap2D, false);
    }
  }
}
