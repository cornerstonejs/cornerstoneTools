import BaseAnnotationTool from '../base/BaseAnnotationTool.js';

import createNewMeasurement from './bidirectionalTool/createNewMeasurement.js';
import pointNearTool from './bidirectionalTool/pointNearTool.js';
import renderToolData from './bidirectionalTool/renderToolData.js';
import addNewMeasurement from './bidirectionalTool/addNewMeasurement.js';
import _moveCallback from './bidirectionalTool/mouseMoveCallback.js';
import handleSelectedCallback from './bidirectionalTool/handleSelectedCallback.js';
import handleSelectedMouseCallback from './bidirectionalTool/handleSelectedMouseCallback.js';
import handleSelectedTouchCallback from './bidirectionalTool/handleSelectedTouchCallback.js';
import toolColors from '../../stateManagement/toolColors.js';
import { bidirectionalCursor } from '../cursors/index.js';

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
  constructor(props) {
    const defaultProps = {
      name: 'Bidirectional',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: {
        changeMeasurementLocationCallback: emptyLocationCallback,
        getMeasurementLocationCallback: emptyLocationCallback,
        textBox: '',
        shadow: '',
        drawHandlesOnHover: true,
        additionalData: [],
      },
      svgCursor: bidirectionalCursor,
    };

    super(props, defaultProps);

    this.createNewMeasurement = createNewMeasurement.bind(this);
    this.pointNearTool = pointNearTool.bind(this);
    this.renderToolData = renderToolData.bind(this);
    this.addNewMeasurement = addNewMeasurement.bind(this);
    this._moveCallback = _moveCallback.bind(this);

    this.handleSelectedCallback = handleSelectedCallback.bind(this);
    this.handleSelectedMouseCallback = handleSelectedMouseCallback.bind(this);
    this.handleSelectedTouchCallback = handleSelectedTouchCallback.bind(this);
  }
}
