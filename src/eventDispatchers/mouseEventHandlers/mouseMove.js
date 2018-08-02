import external from './../../externalModules.js';
// State
import { getters, setters, state } from './../../store/index.js';
import { getToolState } from './../../stateManagement/toolState.js';
import handleActivator from './../../manipulators/handleActivator.js';
import getInteractiveToolsForElement from './../../store/getInteractiveToolsForElement.js';
import getToolsWithDataForElement from './../../store/getToolsWithDataForElement.js';

const cornerstone = external.cornerstone;

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
  setters.mousePositionImage(currentPoints.image);

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

    // force image update if the active tool has a cusror that should update on mouseMove.
    if (firstActiveTool.hasCursor) {
      cornerstone.updateImage(element);
    }
  }

  tools = getToolsWithDataForElement(element, tools);

  // Iterate over each tool, and each tool's data
  // Activate any handles we're hovering over, or whole tools if we're near the tool
  // If we've changed the state of anything, redrawn the image
  let imageNeedsUpdate = false;

  for (let t = 0; t < tools.length; t++) {
    const tool = tools[t];
    const coords = currentPoints.canvas;
    const toolState = getToolState(element, tool.name);

    for (let d = 0; d < toolState.data.length; d++) {
      const data = toolState.data[d];

      // Hovering a handle?
      if (handleActivator(element, data.handles, coords) === true) {
        imageNeedsUpdate = true;
      }

      // Tool data's 'active' does not match coordinates
      // TODO: can't we just do an if/else and save on a pointNearTool check?
      const nearToolAndNotMarkedActive =
        tool.pointNearTool(element, data, coords) && !data.active;
      const notNearToolAndMarkedActive =
        !tool.pointNearTool(element, data, coords) && data.active;

      if (nearToolAndNotMarkedActive || notNearToolAndMarkedActive) {
        data.active = !data.active;
        imageNeedsUpdate = true;
      }

      // TODO: We may want to do _only_ this, and provide a default implementation
      // TODO: On each tool?
      if (typeof tool.mouseMoveCallback === 'function') {
        tool.mouseMoveCallback(evt);
      }
    }
  }

  // Tool data activation status changed, redraw the image
  if (imageNeedsUpdate === true) {
    cornerstone.updateImage(element);
  }
}
