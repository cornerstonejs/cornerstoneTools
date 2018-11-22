import BaseAnnotationTool from '../base/BaseAnnotationTool.js';

import createNewMeasurement from './bidirectionalTool/createNewMeasurement.js';
import pointNearTool from './bidirectionalTool/pointNearTool.js';
import renderToolData from './bidirectionalTool/renderToolData.js';
import addNewMeasurement from './bidirectionalTool/addNewMeasurement.js';
import _moveCallback from './bidirectionalTool/mouseMoveCallback.js';
import preMouseDownCallback from './bidirectionalTool/preMouseDownCallback.js';
import preTouchStartCallback from './bidirectionalTool/preTouchStartCallback.js';

const emptyLocationCallback = (measurementData, eventData, doneCallback) =>
  doneCallback();

/**
 * @public
 * @class BidirectionalTool
 * @memberof Tools.Annotation
 * @classdesc Create and position an annotation that measures the
 * length and width of a region.
 * @extends Tools.Base.BaseAnnotationTool
 */

export default class BidirectionalTool extends BaseAnnotationTool {
  constructor(configuration = {}) {
    const textBoxConfig = '';
    const shadowConfig = '';

    const defaultConfig = {
      name: 'Bidirectional',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: {
        changeMeasurementLocationCallback: emptyLocationCallback,
        getMeasurementLocationCallback: emptyLocationCallback,
        textBox: textBoxConfig,
        shadow: shadowConfig,
        drawHandlesOnHover: true,
        additionalData: [],
      },
    };

    const mergedConfiguration = Object.assign(
      defaultConfig.configuration,
      configuration
    );
    const initialConfiguration = Object.assign(defaultConfig, {
      configuration: mergedConfiguration,
    });

    super(initialConfiguration);

    this.createNewMeasurement = createNewMeasurement.bind(this);
    this.pointNearTool = pointNearTool.bind(this);
    this.renderToolData = renderToolData.bind(this);
    this.addNewMeasurement = addNewMeasurement.bind(this);
    this._moveCallback = _moveCallback.bind(this);

    this.preMouseDownCallback = preMouseDownCallback.bind(this);
    this.preTouchStartCallback = preTouchStartCallback.bind(this);
  }
}
