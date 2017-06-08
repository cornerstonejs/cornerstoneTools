import * as cornerstone from 'cornerstone-core';
import mouseButtonTool from '../imageTools/mouseButtonTool';
import drawHandles from '../manipulators/drawHandles';
import setContextToDisplayFontSize from '../util/setContextToDisplayFontSize';
import { getToolState } from '../stateManagement/toolState';
import MeasurementManager from '../measurementManager/measurementManager';
import LineSampleMeasurement from '../measurementManager/lineSampleMeasurement';

const toolType = 'probe4D';

function updateLineSample (measurementData) {
  const samples = [];

  measurementData.timeSeries.stacks.forEach(function (stack) {
    let loader;

    if (stack.preventCache === true) {
      loader = cornerstone.loadImage(stack.imageIds[measurementData.imageIdIndex]);
    } else {
      loader = cornerstone.loadAndCacheImage(stack.imageIds[measurementData.imageIdIndex]);
    }

    loader.then(function (image) {
      const offset = Math.round(measurementData.handles.end.x) + Math.round(measurementData.handles.end.y) * image.width;
      const sample = image.getPixelData()[offset];

      samples.push(sample);
    });
  });
  measurementData.lineSample.set(samples);
}

// /////// BEGIN ACTIVE TOOL ///////
function createNewMeasurement (mouseEventData) {
  const timeSeriestoolData = getToolState(mouseEventData.element, 'timeSeries');

  if (timeSeriestoolData === undefined || timeSeriestoolData.data === undefined || timeSeriestoolData.data.length === 0) {
    return;
  }

  const timeSeries = timeSeriestoolData.data[0];

    // Create the measurement data for this tool with the end handle activated
  const measurementData = {
    timeSeries,
    lineSample: new LineSampleMeasurement(),
    imageIdIndex: timeSeries.stacks[timeSeries.currentStackIndex].currentImageIdIndex,
    visible: true,
    handles: {
      end: {
        x: mouseEventData.currentPoints.image.x,
        y: mouseEventData.currentPoints.image.y,
        highlight: true,
        active: true
      }
    }
  };

  updateLineSample(measurementData);
  MeasurementManager.add(measurementData);

  return measurementData;
}
// /////// END ACTIVE TOOL ///////

// /////// BEGIN IMAGE RENDERING ///////

function onImageRendered (e, eventData) {
    // If we have no toolData for this element, return immediately as there is nothing to do
  const toolData = getToolState(e.currentTarget, toolType);

  if (!toolData) {
    return;
  }

    // We have tool data for this element - iterate over each one and draw it
  const context = eventData.canvasContext.canvas.getContext('2d');

  cornerstone.setToPixelCoordinateSystem(eventData.enabledElement, context);
  const color = 'white';

  for (let i = 0; i < toolData.data.length; i++) {
    context.save();
    const data = toolData.data[i];

        // Draw the handles
    context.beginPath();
    drawHandles(context, eventData, data.handles, color);
    context.stroke();

        // Draw text
    const fontParameters = setContextToDisplayFontSize(eventData.enabledElement, eventData.canvasContext, 15);

    context.font = `${fontParameters.fontSize}px Arial`;

        // Translate the x/y away from the cursor
    const x = Math.round(data.handles.end.x);
    const y = Math.round(data.handles.end.y);
    const textX = data.handles.end.x + 3;
    const textY = data.handles.end.y - 3;

    context.fillStyle = color;

    context.fillText(`${x},${y}`, textX, textY);

    context.restore();
  }
}
// /////// END IMAGE RENDERING ///////

// Module exports
const probeTool4D = mouseButtonTool({
  createNewMeasurement,
  onImageRendered,
  toolType
});

export default probeTool4D;
