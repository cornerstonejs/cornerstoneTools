import external from './../../../externalModules.js';
import toolCoordinates from './../../../stateManagement/toolCoordinates.js';
import getHandleNearImagePoint from './../../../manipulators/getHandleNearImagePoint.js';
import { getToolState } from './../../../stateManagement/toolState.js';

// Replaces the cornerstoneTools.handleActivator function by skiping the active handle comparison
const handleActivator = (
  element,
  handles,
  canvasPoint,
  distanceThreshold = 6
) => {
  const nearbyHandle = getHandleNearImagePoint(
    element,
    handles,
    canvasPoint,
    distanceThreshold
  );

  let handleActivatorChanged = false;

  Object.keys(handles).forEach(handleKey => {
    if (handleKey === 'textBox') {
      return;
    }
    const handle = handles[handleKey];
    const newActiveState = handle === nearbyHandle;

    if (handle.active !== newActiveState) {
      handleActivatorChanged = true;
    }

    handle.active = newActiveState;
  });

  return handleActivatorChanged;
};

// MouseMoveCallback is used to hide handles when mouse is away
export default function(event) {
  const eventData = event.detail;
  const { element } = eventData;

  toolCoordinates.setCoords(eventData);

  // If we have no tool data for this element, do nothing
  const toolData = getToolState(element, this.name);

  if (!toolData) {
    return;
  }

  // We have tool data, search through all data and see if we can activate a handle
  let imageNeedsUpdate = false;

  for (let i = 0; i < toolData.data.length; i++) {
    // Get the cursor position in canvas coordinates
    const coords = eventData.currentPoints.canvas;

    const data = toolData.data[i];
    const handleActivatorChanged = handleActivator(
      element,
      data.handles,
      coords
    );

    Object.keys(data.handles).forEach(handleKey => {
      if (handleKey === 'textBox') {
        return;
      }
      const handle = data.handles[handleKey];

      handle.hover = handle.active;
    });

    if (handleActivatorChanged) {
      imageNeedsUpdate = true;
    }

    const nearTool = this.pointNearTool(element, data, coords, 'mouse');
    const nearToolAndInactive = nearTool && !data.active;
    const notNearToolAndActive = !nearTool && data.active;

    if (nearToolAndInactive || notNearToolAndActive) {
      data.active = !data.active;
      imageNeedsUpdate = true;
    }
  }

  // Handle activation status changed, redraw the image
  if (imageNeedsUpdate === true) {
    external.cornerstone.updateImage(element);
  }
}
