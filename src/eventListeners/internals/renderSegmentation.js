import { getModule } from '../../store/index.js';
import renderSegmentationFill from './renderSegmentationFill';
import renderSegmentationOutline from './renderSegmentationOutline';

const segmentationModule = getModule('segmentation');

/**
 * Renders the segmentation based on the brush configuration and
 * the active status of the labelmap.
 * @param  {Object} evt                 The cornerstone event.
 * @param  {Labelmap3D} labelmap3D  The `Labelmap3D` object.
 * @param  {number} labelmapIndex The index of the active label map.
 * @param  {Labelmap2D} labelmap2D The `Labelmap2D` object to render.
 * @param  {boolean} isActiveLabelMap Whether or not the labelmap is active.
 * @returns {null}
 */
export default function renderSegmentation(
  evt,
  labelmap3D,
  labelmapIndex,
  labelmap2D,
  isActiveLabelMap
) {
  if (shouldRenderFill(isActiveLabelMap)) {
    renderSegmentationFill(
      evt,
      labelmap3D,
      labelmap2D,
      labelmapIndex,
      isActiveLabelMap
    );
  }

  if (shouldRenderOutline(isActiveLabelMap)) {
    renderSegmentationOutline(
      evt,
      labelmap3D,
      labelmap2D,
      labelmapIndex,
      isActiveLabelMap
    );
  }
}

/**
 * ShouldRenderFill - Returns true if `configuration.renderFill`
 * is true , and if the global alpha is not zero.
 *
 * @param  {boolean} isActiveLabelMap
 * @returns  {boolean} True if the segmentation should be filled.
 */
function shouldRenderFill(isActiveLabelMap) {
  const { configuration } = segmentationModule;

  return (
    configuration.renderFill &&
    ((isActiveLabelMap && configuration.fillAlpha !== 0) ||
      (!isActiveLabelMap && configuration.fillAlphaInactive !== 0))
  );
}

/**
 * ShouldRenderOutline - Returns true if `configuration.renderOutline`
 * is true , and if the global alpha is not zero.
 *
 * @param  {boolean} isActiveLabelMap
 * @returns  {boolean} True if the segmentation should be outlined.
 */
function shouldRenderOutline(isActiveLabelMap) {
  const { configuration } = segmentationModule;

  return (
    configuration.renderOutline &&
    ((isActiveLabelMap && configuration.outlineAlpha !== 0) ||
      (!isActiveLabelMap && configuration.outlineAlphaInactive !== 0))
  );
}
