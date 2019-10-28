import EVENTS from '../../../events.js';
import {
  getToolState,
  removeToolState,
} from '../../../stateManagement/toolState.js';
import external from '../../../externalModules.js';

// Implements the touch activation behavior and empty measurements prevention
export default function(evt) {
  const { element, currentPoints } = evt.detail;
  const lastCanvasPoints = currentPoints.canvas;

  const touchEndCallback = evt => {
    const { element, currentPoints } = evt.detail;

    element.removeEventListener(EVENTS.TOUCH_END, touchEndCallback);

    let isEmptyMeasurement = false;
    const isEqualX = currentPoints.canvas.x === lastCanvasPoints.x;
    const isEqualY = currentPoints.canvas.y === lastCanvasPoints.y;
    const isSamePosition = isEqualX && isEqualY;
    const toolState = getToolState(element, this.name);
    const measurementData = toolState.data.find(data =>
      this.pointNearTool(element, data, lastCanvasPoints, 'touch')
    );

    if (measurementData) {
      const { point } = external.cornerstoneMath;
      const { start, end } = measurementData.handles;

      isEmptyMeasurement = point.distance(start, end) === 0;
    }

    if (isEmptyMeasurement || isSamePosition) {
      // Delete the measurement if no dragging was performed during touch
      if (isEmptyMeasurement) {
        measurementData.isCreating = false;
        measurementData.cancelled = true;

        removeToolState(element, this.name, measurementData);
        external.cornerstone.updateImage(element);
      }

      toolState.data.forEach(data => {
        if (data !== measurementData) {
          data.active = false;
          data.activeTouch = false;
        }
      });

      if (measurementData) {
        measurementData.activeTouch = !measurementData.activeTouch;
      }
    }
  };

  element.addEventListener(EVENTS.TOUCH_END, touchEndCallback);

  return false;
}
