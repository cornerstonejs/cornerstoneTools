import external from '../externalModules.js';
import { state } from './../store/index.js';

/**
 * Return the handle position considering offset for touch interaction.
 * @public
 * @function getHandlePixelPosition
 * @memberof Manipulators
 *
 * @param {Object} eventData - Data object associated with the event
 * @param {string} interactionType - Type of user's input
 * @returns {Object} - The translated point object
 */
export default function(eventData, interactionType) {
  const { currentPoints, element } = eventData;
  const page = currentPoints.page;
  const touchOffset = state.handleTouchOffset;
  return external.cornerstone.pageToPixel(
    element,
    interactionType === 'touch' ? page.x + touchOffset.x : page.x,
    interactionType === 'touch' ? page.y + touchOffset.y : page.y
  );
}
