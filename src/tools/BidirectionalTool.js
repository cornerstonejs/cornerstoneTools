/* eslint no-loop-func: 0 */ // --> OFF
/* eslint class-methods-use-this: 0 */ // --> OFF
/* eslint no-alert: 0 */ // --> OFF
import external from '../externalModules.js';
import BaseAnnotationTool from '../base/BaseAnnotationTool.js';

import createNewMeasurement from './bidirectionalTool/createNewMeasurement.js';
import pointNearTool from './bidirectionalTool/pointNearTool.js';
import renderToolData from './bidirectionalTool/renderToolData.js';
import doubleClickCallback from './bidirectionalTool/doubleClickCallback.js';
import addNewMeasurement from './bidirectionalTool/addNewMeasurement.js';
import mouseMoveCallback from './bidirectionalTool/mouseMoveCallback.js';
import mouseDownCallback from './bidirectionalTool/mouseDownCallback.js';

const emptyLocationCallback = (measurementData, eventData, doneCallback) => doneCallback();

export default class BidirectionalTool extends BaseAnnotationTool {
  constructor (name = 'Bidirectional') {
    const textBoxConfig = '';
    const shadowConfig = '';

    super({
      name,
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: {
        getMeasurementLocationCallback: emptyLocationCallback,
        changeMeasurementLocationCallback: emptyLocationCallback,
        textBox: textBoxConfig,
        shadow: shadowConfig
      }
    });

    this.createNewMeasurement = createNewMeasurement.bind(this);
    this.pointNearTool = pointNearTool.bind(this);
    this.renderToolData = renderToolData.bind(this);
    this.addNewMeasurement = addNewMeasurement.bind(this);
    this.doubleClickCallback = doubleClickCallback.bind(this);
    this.mouseMoveCallback = mouseMoveCallback.bind(this);
    this.mouseDownCallback = mouseDownCallback.bind(this);
  }
}

