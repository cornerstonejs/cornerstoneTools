import external from '../externalModules.js';
import mouseButtonTool from './mouseButtonTool.js';
import touchTool from './touchTool.js';
import drawLinkedTextBox from '../util/drawLinkedTextBox.js';
import toolColors from '../stateManagement/toolColors.js';
import drawHandles from '../manipulators/drawHandles.js';
import { getToolState } from '../stateManagement/toolState.js';
import lineSegDistance from '../util/lineSegDistance.js';
import { getNewContext, draw, setShadow, drawLine } from '../util/drawing.js';

const toolType = 'length';

// /////// BEGIN ACTIVE TOOL ///////
function createNewMeasurement (mouseEventData) {
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
      },
      textBox: {
        active: false,
        hasMoved: false,
        movesIndependently: false,
        drawnIndependently: true,
        allowedOutsideImage: true,
        hasBoundingBox: true
      }
    }
  };


  return measurementData;
}
// /////// END ACTIVE TOOL ///////

function pointNearTool (element, data, coords) {
  if (data.visible === false) {
    return false;
  }

  return lineSegDistance(element, data.handles.start, data.handles.end, coords) < 25;
}

// /////// BEGIN IMAGE RENDERING ///////
function onImageRendered (e) {
  const eventData = e.detail;
  const enabledElement = eventData.enabledElement;

  // If we have no toolData for this element, return immediately as there is nothing to do
  const toolData = getToolState(e.currentTarget, toolType);

  if (!toolData) {
    return;
  }

  const cornerstone = external.cornerstone;
  // We have tool data for this element - iterate over each one and draw it
  const context = getNewContext(eventData.canvasContext.canvas);
  const { image, element } = eventData;

  const config = length.getConfiguration();
  const imagePlane = cornerstone.metaData.get('imagePlaneModule', image.imageId);
  let rowPixelSpacing;
  let colPixelSpacing;

  if (imagePlane) {
    rowPixelSpacing = imagePlane.rowPixelSpacing || imagePlane.rowImagePixelSpacing;
    colPixelSpacing = imagePlane.columnPixelSpacing || imagePlane.colImagePixelSpacing;
  } else {
    rowPixelSpacing = image.rowPixelSpacing;
    colPixelSpacing = image.columnPixelSpacing;
  }

  for (let i = 0; i < toolData.data.length; i++) {
    const data = toolData.data[i];

    if (data.visible === false) {
      continue;
    }
    const color = toolColors.getColorIfActive(data);
    const handleOptions = {
      drawHandlesIfActive: (config && config.drawHandlesOnHover)
    };
    const text = textBoxText(data, rowPixelSpacing, colPixelSpacing);

    // Move the textbox slightly to the right and upwards
    // So that it sits beside the length tool handle
    const xOffset = 10;

    draw(context, (context) => {
      setShadow(context, config);
      drawLine(context, element, data.handles.start, data.handles.end, { color });
      drawHandles(context, eventData.element, data.handles, color, handleOptions);
      drawLinkedTextBox(context, element, enabledElement, data.handles.textBox, text,
        data.handles, textBoxAnchorPoints, textBoxCoords, color, xOffset, true);
    });
  }

  function textBoxCoords (context, element, enabledElement, handles) {
    const coords = {
      x: Math.max(handles.start.x, handles.end.x)
    };

    // Depending on which handle has the largest x-value,
    // Set the y-value for the text box
    if (coords.x === handles.start.x) {
      coords.y = handles.start.y;
    } else {
      coords.y = handles.end.y;
    }

    return coords;
  }

  function textBoxText (data, rowPixelSpacing, colPixelSpacing) {
    // Set the length text suffix depending on whether or not pixelSpacing is available
    let suffix = ' mm';

    if (!rowPixelSpacing || !colPixelSpacing) {
      suffix = ' pixels';
    }

    return `${data.length.toFixed(2)}${suffix}`;
  }

  function textBoxAnchorPoints (handles) {
    const midpoint = {
      x: (handles.start.x + handles.end.x) / 2,
      y: (handles.start.y + handles.end.y) / 2
    };

    return [handles.start, midpoint, handles.end];
  }
}
// /////// END IMAGE RENDERING ///////

// Module exports
const length = mouseButtonTool({
  createNewMeasurement,
  onImageRendered,
  pointNearTool,
  toolType
});

const lengthTouch = touchTool({
  createNewMeasurement,
  onImageRendered,
  pointNearTool,
  toolType
});

export {
  length,
  lengthTouch
};
