import external from '../externalModules.js';
import mouseButtonRectangleTool from './mouseButtonRectangleTool.js';
import touchTool from './touchTool.js';
import toolColors from '../stateManagement/toolColors.js';
import drawHandles from '../manipulators/drawHandles.js';
import { getToolState } from '../stateManagement/toolState.js';
import { getNewContext, draw, fillOutsideRect, drawRect } from '../util/drawing.js';

const toolType = 'highlight';

// /////// BEGIN ACTIVE TOOL ///////
function createNewMeasurement (mouseEventData) {
  // If already a highlight measurement, creating a new one will be useless
  const existingToolData = getToolState(mouseEventData.event.currentTarget, toolType);

  if (existingToolData && existingToolData.data && existingToolData.data.length > 0) {
    return;
  }

  // Create the measurement data for this tool with the end handle activated
  const measurementData = {
    visible: true,
    active: true,
    color: undefined,
    handles: {
      start: {
        x: mouseEventData.currentPoints.image.x,
        y: mouseEventData.currentPoints.image.y,
        highlight: true,
        active: false
      },
      end: {
        x: mouseEventData.currentPoints.image.x,
        y: mouseEventData.currentPoints.image.y,
        highlight: true,
        active: true
      }
    }
  };

  return measurementData;
}
// /////// END ACTIVE TOOL ///////

function pointInsideRect (element, data, coords) {
  const cornerstone = external.cornerstone;
  const startCanvas = cornerstone.pixelToCanvas(element, data.handles.start);
  const endCanvas = cornerstone.pixelToCanvas(element, data.handles.end);

  const rect = {
    left: Math.min(startCanvas.x, endCanvas.x),
    top: Math.min(startCanvas.y, endCanvas.y),
    width: Math.abs(startCanvas.x - endCanvas.x),
    height: Math.abs(startCanvas.y - endCanvas.y)
  };

  let insideBox = false;

  if ((coords.x >= rect.left && coords.x <= (rect.left + rect.width)) && coords.y >= rect.top && coords.y <= (rect.top + rect.height)) {
    insideBox = true;
  }

  return insideBox;
}

function pointNearTool (element, data, coords) {
  if (data.visible === false) {
    return false;
  }

  const cornerstone = external.cornerstone;
  const startCanvas = cornerstone.pixelToCanvas(element, data.handles.start);
  const endCanvas = cornerstone.pixelToCanvas(element, data.handles.end);

  const rect = {
    left: Math.min(startCanvas.x, endCanvas.x),
    top: Math.min(startCanvas.y, endCanvas.y),
    width: Math.abs(startCanvas.x - endCanvas.x),
    height: Math.abs(startCanvas.y - endCanvas.y)
  };

  const distanceToPoint = external.cornerstoneMath.rect.distanceToPoint(rect, coords);


  return (distanceToPoint < 5);
}

// /////// BEGIN IMAGE RENDERING ///////

function onImageRendered (e) {
  const eventData = e.detail;

  // If we have no toolData for this element, return immediately as there is nothing to do
  const toolData = getToolState(e.currentTarget, toolType);

  if (toolData === undefined) {
    return;
  }

  // We have tool data for this elemen
  const context = getNewContext(eventData.canvasContext.canvas);

  const data = toolData.data[0];

  if (data.visible === false) {
    return;
  }

  if (!data) {
    return;
  }

  draw(context, (context) => {

    // Draw dark fill outside the rectangle
    let options = {
      color: 'transparent',
      fillStyle: 'rgba(0,0,0,0.7)'
    };

    fillOutsideRect(context, eventData.element, data.handles.start, data.handles.end, options);

    const color = toolColors.getColorIfActive(data);

    // Draw dashed stroke rectangle
    options = {
      color,
      lineDash: [4]
    };

    drawRect(context, eventData.element, data.handles.start, data.handles.end, options);
    // Draw the handles last, so they will be on top of the overlay
    drawHandles(context, eventData, data.handles, color);
  });
}
// /////// END IMAGE RENDERING ///////

// Module exports
const preventHandleOutsideImage = true;

const highlight = mouseButtonRectangleTool({
  createNewMeasurement,
  onImageRendered,
  pointNearTool,
  pointInsideRect,
  toolType
}, preventHandleOutsideImage);

const highlightTouch = touchTool({
  createNewMeasurement,
  onImageRendered,
  pointNearTool,
  pointInsideRect,
  toolType
}, preventHandleOutsideImage);

export {
  highlight,
  highlightTouch
};
