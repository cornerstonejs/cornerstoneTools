import external from './../../externalModules.js';
// State
import { getters, state } from './../../store/index.js';
import getInteractiveToolsForElement from './../../store/getInteractiveToolsForElement.js';
import getToolsWithDataForElement from './../../store/getToolsWithDataForElement.js';

/**
 * This is mostly used to update the [un]hover state
 * of a tool.
 *
 * @param {*} evt
 */
export default function (evt) {
  if (state.isToolLocked) {
    return;
  }

  let tools;
  const { element, currentPoints } = evt.detail;

  // Set the mouse position incase any tool needs it.
  state.mousePositionImage = currentPoints.image;

  // TODO: instead of filtering these for every interaction, we can change our
  // TODO: State's structure to always know these values.
  // Filter out disabled and enabled
  tools = getInteractiveToolsForElement(element, getters.mouseTools());

  const activeTools = tools.filter((tool) => tool.mode === 'active');

  // If any tools are active, check if they have a cursor.
  if (activeTools.length > 0) {
    // TODO: If length > 1, you could assess fitness and select the ideal tool
    // TODO: But because we're locking this to 'active' tools, that should rarely be an issue
    const firstActiveTool = activeTools[0];

    // Force image update if the active tool has a cusror that should update on mouseMove.
    if (firstActiveTool.hasCursor) {
      external.cornerstone.updateImage(element);
    }
  }

  tools = getToolsWithDataForElement(element, tools);

  // Iterate over each tool, and each tool's data
  // Activate any handles we're hovering over, or whole tools if we're near the tool
  // If we've changed the state of anything, redrawn the image
  let imageNeedsUpdate = false;

  for (let t = 0; t < tools.length; t++) {
    const tool = tools[t];

    if (typeof tool.mouseMoveCallback === 'function') {
      imageNeedsUpdate = tool.mouseMoveCallback(evt) || imageNeedsUpdate;
    }
  }

  // Tool data activation status changed, redraw the image
  if (imageNeedsUpdate === true) {
    external.cornerstone.updateImage(element);
  }
}
