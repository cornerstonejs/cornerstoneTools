import external from '../../externalModules';
import EVENTS from '../../events.js';
import { getModule } from '../../store';

/**
 * Triggers the LABELMAP_MODIFIED event for the active element, providing the labelmapIndex that was modified.
 *
 * @param {HTMLElement} element
 * @param {number} labelmapIndex The labelmapIndex. Defaults to the active for that element if not set.
 */
export default function triggerLabelmapModifiedEvent(element, labelmapIndex) {
  const { getters } = getModule('segmentation');

  labelmapIndex =
    labelmapIndex === undefined
      ? getters.activeLabelmapIndex(element)
      : labelmapIndex;

  external.cornerstone.triggerEvent(element, EVENTS.LABELMAP_MODIFIED, {
    labelmapIndex,
  });
}
