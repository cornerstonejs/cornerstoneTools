import { getToolState } from '../../../stateManagement/toolState.js';
import state from './state';
import getElement from './getElement';

import { getLogger } from '../../../util/logger';

const logger = getLogger('store:modules:segmentationModule:getBrushColor');

/**
 * Returns the brush color as a rgba CSS color for the active segment of the active
 * `Labelmap3D` for the `BrushStackState` displayed on the element.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @param  {boolean} drawing = false    Whether the user is drawing or not.
 * @returns {string}                    An rgba value as a string.
 */
export default function getBrushColor(
  elementOrEnabledElementUID,
  drawing = false
) {
  const element = getElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const stackState = getToolState(element, 'stack');

  if (!stackState) {
    logger.error(
      'Consumers must define stacks in their application if using segmentations in cornerstoneTools.'
    );

    return;
  }

  const stackData = stackState.data[0];
  const firstImageId = stackData.imageIds[0];

  const brushStackState = state.series[firstImageId];

  let color;

  if (brushStackState) {
    const activeLabelmapIndex = brushStackState.activeLabelmapIndex;
    const labelmap3D = brushStackState.labelmaps3D[activeLabelmapIndex];

    const activeSegmentIndex = labelmap3D.activeSegmentIndex;

    color = state.colorLutTables[labelmap3D.colorLUTIndex][activeSegmentIndex];
  } else {
    // No data yet, make brush the default color of colormap 0.
    color = state.colorLutTables[0][1];
  }

  return drawing
    ? `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1.0 )`
    : `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.8 )`;
}
