import { Viewerbase } from 'meteor/ohif:viewerbase';
import mouseButtonTool from '../mouseButtonTool.js';
import touchTool from '../touchTool.js';
import { toolType } from './definitions.js';
import createNewMeasurement from './createNewMeasurement.js';
import addNewMeasurement from './addNewMeasurement.js';
import addNewMeasurementTouch from './addNewMeasurementTouch.js';
import onImageRendered from './onImageRendered/index.js';
import pointNearTool from './pointNearTool.js';
import mouseDownCallback from './mouseDownCallback.js';
import mouseMoveCallback from './mouseMoveCallback.js';

function createToolInterface () {
  const toolInterface = { toolType };
  const baseInterface = {
    createNewMeasurement,
    onImageRendered,
    pointNearTool,
    toolType
  };

  toolInterface.mouse = mouseButtonTool(Object.assign({
    addNewMeasurement,
    mouseDownCallback,
    mouseMoveCallback
  }, baseInterface));

  toolInterface.touch = touchTool(Object.assign({
    addNewMeasurement: addNewMeasurementTouch
  }, baseInterface));

  return toolInterface;
}

const toolInterface = createToolInterface();

cornerstoneTools[toolType] = toolInterface.mouse;
cornerstoneTools[`${toolType}Touch`] = toolInterface.touch;

// Define an empty location callback
const emptyLocationCallback = (measurementData, eventData, doneCallback) => doneCallback();
const { shadowConfig, textBoxConfig } = Viewerbase.toolManager.getToolDefaultStates();

cornerstoneTools[toolType].setConfiguration({
  getMeasurementLocationCallback: emptyLocationCallback,
  changeMeasurementLocationCallback: emptyLocationCallback,
  textBox: textBoxConfig,
  shadow: shadowConfig
});
