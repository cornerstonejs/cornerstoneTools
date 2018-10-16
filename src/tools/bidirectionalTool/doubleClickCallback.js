import external from '../../externalModules.js';
import { toolType } from './definitions.js';
import pointNearTool from './pointNearTool.js';
import { removeToolState, getToolState } from '../../stateManagement/toolState.js';

export default function (event) {
  const eventData = event.detail;
  const { element } = eventData;

  function doneCallback (data, deleteTool) {
    if (deleteTool === true) {
      removeToolState(element, toolType, data);
      external.cornerstone.updateImage(element);
    }
  }

  // Check if the element is enabled and stop here if not
  try {
    external.cornerstone.getEnabledElement(element);
  } catch (error) {
    return;
  }

  const config = this.configuration;

  const coords = eventData.currentPoints.canvas;
  const toolData = getToolState(element, toolType);

  // Now check to see if there is a handle we can move
  if (!toolData) {
    return;
  }

  let data;

  for (let i = 0; i < toolData.data.length; i++) {
    data = toolData.data[i];
    if (pointNearTool(element, data, coords)) {
      data.active = true;
      external.cornerstone.updateImage(element);
      // Allow relabelling via a callback
      config.changeMeasurementLocationCallback(data, eventData, doneCallback);

      event.stopImmediatePropagation();

      return false;
    }
  }
}
