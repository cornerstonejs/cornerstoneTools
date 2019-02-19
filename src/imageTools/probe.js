import triggerMeasurementCompletedEvent from '../util/triggerMeasurementCompletedEvent.js';
import external from '../externalModules.js';
import mouseButtonTool from './mouseButtonTool.js';
import touchTool from './touchTool.js';
import toolColors from '../stateManagement/toolColors.js';
import textStyle from '../stateManagement/textStyle.js';
import drawHandles from '../manipulators/drawHandles.js';
import drawTextBox from '../util/drawTextBox.js';
import getRGBPixels from '../util/getRGBPixels.js';
import calculateSUV from '../util/calculateSUV.js';
import { getToolState } from '../stateManagement/toolState.js';
import { getNewContext, draw } from '../util/drawing.js';

const toolType = 'probe';

// /////// BEGIN ACTIVE TOOL ///////
function createNewMeasurement (mouseEventData) {
  // Create the measurement data for this tool with the end handle activated
  const measurementData = {
    visible: true,
    active: true,
    color: undefined,
    handles: {
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

// /////// BEGIN IMAGE RENDERING ///////
function pointNearTool (element, data, coords) {
  if (data.visible === false) {
    return false;
  }

  const endCanvas = external.cornerstone.pixelToCanvas(element, data.handles.end);


  return external.cornerstoneMath.point.distance(endCanvas, coords) < 5;
}

function onImageRendered (e) {
  const eventData = e.detail;

  // If we have no toolData for this element, return immediately as there is nothing to do
  const toolData = getToolState(e.currentTarget, toolType);

  if (!toolData) {
    return;
  }

  const cornerstone = external.cornerstone;
  // We have tool data for this element - iterate over each one and draw it
  const context = getNewContext(eventData.canvasContext.canvas);

  const fontHeight = textStyle.getFontSize();
  const config = probe.getConfiguration();

  for (let i = 0; i < toolData.data.length; i++) {
    const data = toolData.data[i];

    if (data.visible === false) {
      continue;
    }

    draw(context, (context) => {

      const color = toolColors.getColorIfActive(data);

      // Draw the handles
      drawHandles(context, eventData, data.handles, color);

      if (config && config.disableTextBox) {
        return;
      }

      calculateDisplayData(data, eventData.element, eventData.image);

      if (data.str && data.text) {
        const coords = {
          // Translate the x/y away from the cursor
          x: data.handles.end.x + 3,
          y: data.handles.end.y - 3
        };
        const textCoords = cornerstone.pixelToCanvas(eventData.element, coords);

        drawTextBox(context, data.str, textCoords.x, textCoords.y + fontHeight + 5, color);
        drawTextBox(context, data.text, textCoords.x, textCoords.y, color);
      }
    });
  }
}
// /////// END IMAGE RENDERING ///////

function onHandleDoneMove (element, data) {
  const image = external.cornerstone.getImage(element);

  calculateDisplayData(data, element, image);

  triggerMeasurementCompletedEvent(element, data, toolType);
}

function calculateDisplayData (data, element, image) {
  const x = Math.round(data.handles.end.x);
  const y = Math.round(data.handles.end.y);
  let storedPixels;

  if (x >= 0 && y >= 0 && x < image.columns && y < image.rows) {
    if (image.color) {
      data.text = `${x}, ${y}`;
      storedPixels = getRGBPixels(element, x, y, 1, 1);
      data.str = `R: ${storedPixels[0]} G: ${storedPixels[1]} B: ${storedPixels[2]}`;
    } else {
      storedPixels = external.cornerstone.getStoredPixels(element, x, y, 1, 1);
      const sp = storedPixels[0];
      const mo = sp * image.slope + image.intercept;
      const suv = calculateSUV(image, sp);

      // Draw text
      data.text = `${x}, ${y}`;
      data.str = `SP: ${sp} MO: ${parseFloat(mo.toFixed(3))}`;

      if (suv) {
        data.str += ` SUV: ${parseFloat(suv.toFixed(3))}`;
      }
    }
  }
}

// Module exports
const probe = mouseButtonTool({
  createNewMeasurement,
  onImageRendered,
  pointNearTool,
  toolType,
  onHandleDoneMove
});

const probeTouch = touchTool({
  createNewMeasurement,
  onImageRendered,
  pointNearTool,
  toolType,
  onHandleDoneMove
});

export {
  probe,
  probeTouch
};
