import EVENTS from '../events.js';
import external from '../externalModules.js';
import triggerEvent from '../util/triggerEvent.js';
import { clipToBox } from '../util/clip.js';
import getActiveTool from '../util/getActiveTool';
import BaseAnnotationTool from '../tools/base/BaseAnnotationTool';

function getCenter(handles) {
  const { start, end } = handles;
  const w = Math.abs(start.x - end.x);
  const h = Math.abs(start.y - end.y);
  const xMin = Math.min(start.x, end.x);
  const yMin = Math.min(start.y, end.y);

  const center = {
    x: xMin + w / 2,
    y: yMin + h / 2,
  };

  return center;
}

export default function(
  mouseEventData,
  toolType,
  data,
  handle,
  doneMovingCallback,
  preventHandleOutsideImage
) {
  const { image, currentPoints, element, buttons } = mouseEventData;
  const cornerstone = external.cornerstone;
  const distanceFromTool = {
    x: handle.x - currentPoints.image.x,
    y: handle.y - currentPoints.image.y,
  };
  const { columns } = mouseEventData.image;

  function mouseDragCallback(e) {
    const eventData = e.detail;

    if (handle.hasMoved === false) {
      handle.hasMoved = true;
    }

    handle.active = true;
    const { start, end } = data.handles;
    let center = getCenter(data.handles);
    const inclination = (end.y - start.y) / (end.x - start.x);
    const rInclination = -(1 / inclination);
    const b = center.y - rInclination * center.x;
    const bb =
      eventData.currentPoints.image.y +
      distanceFromTool.y -
      inclination * (eventData.currentPoints.image.x + distanceFromTool.x);
    const f = (a, x, b) => a * x + b;

    if (handle.key === 'perpendicular') {
      const longLine = {
        start: {
          x: 0,
          y: f(rInclination, 0, b),
        },
        end: {
          x: columns,
          y: f(rInclination, columns, b),
        },
      };
      const shortLine = {
        start: {
          x: 0,
          y: f(inclination, 0, bb),
        },
        end: {
          x: columns,
          y: f(inclination, columns, bb),
        },
      };
      const intersection = external.cornerstoneMath.lineSegment.intersectLine(
        longLine,
        shortLine
      );
      const square = x => x * x;
      const shortestDistance = Math.sqrt(
        square(intersection.x - center.x) + square(intersection.y - center.y)
      );

      data.shortestDistance = shortestDistance;

      handle.x = intersection.x;
      handle.y = intersection.y;
    } else {
      handle.x = eventData.currentPoints.image.x + distanceFromTool.x;
      handle.y = eventData.currentPoints.image.y + distanceFromTool.y;
      center = getCenter(data.handles);
      const theta = Math.atan(rInclination);

      data.handles.perpendicularPoint.x =
        center.x - data.shortestDistance * Math.cos(theta);
      data.handles.perpendicularPoint.y =
        center.y - data.shortestDistance * Math.sin(theta);
    }

    if (preventHandleOutsideImage) {
      clipToBox(handle, eventData.image);
    }

    cornerstone.updateImage(element);
    const activeTool = getActiveTool(element, buttons, 'mouse');

    if (activeTool instanceof BaseAnnotationTool) {
      activeTool.updateCachedStats(image, element, data);
    }
    const eventType = EVENTS.MEASUREMENT_MODIFIED;
    const modifiedEventData = {
      toolType,
      element,
      measurementData: data,
    };

    triggerEvent(element, eventType, modifiedEventData);
  }

  element.addEventListener(EVENTS.MOUSE_DRAG, mouseDragCallback);

  function mouseUpCallback() {
    handle.active = false;
    element.removeEventListener(EVENTS.MOUSE_DRAG, mouseDragCallback);
    element.removeEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
    element.removeEventListener(EVENTS.MOUSE_CLICK, mouseUpCallback);
    cornerstone.updateImage(element);

    if (typeof doneMovingCallback === 'function') {
      doneMovingCallback();
    }
  }

  element.addEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
  element.addEventListener(EVENTS.MOUSE_CLICK, mouseUpCallback);
}
