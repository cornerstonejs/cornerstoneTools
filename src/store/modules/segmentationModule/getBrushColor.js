import { getToolState } from '../../../stateManagement/toolState.js';
import state from './state';
import getElement from './getElement';

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
  const stackData = stackState.data[0];
  const firstImageId = stackData.imageIds[0];

  const brushStackState = state.series[firstImageId];

  let color;

  if (brushStackState) {
    const activeLabelmapIndex = brushStackState.activeLabelmapIndex;
    const labelmap3D = brushStackState.labelmaps3D[activeLabelmapIndex];

    if (labelmap3D) {
      const activeSegmentIndex = labelmap3D.activeSegmentIndex;

      color =
        state.colorLutTables[`${state.colorMapId}_${activeLabelmapIndex}`][
          activeSegmentIndex
        ];
    } else {
      // Just set to new labelmap index
    }
  } else {
    // No data yet, make brush the default color of colormap 0.
    color = state.colorLutTables[`${state.colorMapId}_0`][1];
  }

  return drawing
    ? `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1.0 )`
    : `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.8 )`;
}
