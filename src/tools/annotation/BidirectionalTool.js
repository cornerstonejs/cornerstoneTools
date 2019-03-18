import BaseAnnotationTool from '../base/BaseAnnotationTool.js';
import MouseCursor from '../../util/MouseCursor.js';

import createNewMeasurement from './bidirectionalTool/createNewMeasurement.js';
import pointNearTool from './bidirectionalTool/pointNearTool.js';
import renderToolData from './bidirectionalTool/renderToolData.js';
import addNewMeasurement from './bidirectionalTool/addNewMeasurement.js';
import _moveCallback from './bidirectionalTool/mouseMoveCallback.js';
import handleSelectedCallback from './bidirectionalTool/handleSelectedCallback.js';
import handleSelectedMouseCallback from './bidirectionalTool/handleSelectedMouseCallback.js';
import handleSelectedTouchCallback from './bidirectionalTool/handleSelectedTouchCallback.js';

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
        svgCursor: bidirectionalCursor,
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

    this.handleSelectedCallback = handleSelectedCallback.bind(this);
    this.handleSelectedMouseCallback = handleSelectedMouseCallback.bind(this);
    this.handleSelectedTouchCallback = handleSelectedTouchCallback.bind(this);
  }
}

const bidirectionalCursor = new MouseCursor(
  `<svg
    data-icon="bidirectional" role="img" xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48" width="32" height="32"
  >
    <path fill="#ffffff" stroke="#ffffff" d="M27.63 3.21L3.12 28.81"></path>
    <path fill="#ffffff" stroke="#ffffff" d="M27.63 15.75L15.27 4.43"></path>
    <path fill="#ffffff" stroke="#ffffff" d="M16.5 4.28C16.5 4.96 15.95 5.51 15.27 5.51C14.59 5.51 14.03 4.96 14.03 4.28C14.03 3.59 14.59 3.04 15.27 3.04C15.95 3.04 16.5 3.59 16.5 4.28Z" ></path>
    <path fill="#ffffff" stroke="#ffffff" d="M28.87 3.19C28.87 3.87 28.31 4.43 27.63 4.43C26.95 4.43 26.4 3.87 26.4 3.19C26.4 2.51 26.95 1.95 27.63 1.95C28.31 1.95 28.87 2.51 28.87 3.19Z"></path>
    <path fill="#ffffff" stroke="#ffffff" d="M28.87 15.75C28.87 16.43 28.31 16.99 27.63 16.99C26.95 16.99 26.4 16.43 26.4 15.75C26.4 15.07 26.95 14.51 27.63 14.51C28.31 14.51 28.87 15.07 28.87 15.75Z"></path>
    <path fill="#ffffff" stroke="#ffffff" d="M4.73 28.44C4.73 29.12 4.17 29.68 3.49 29.68C2.81 29.68 2.25 29.12 2.25 28.44C2.25 27.76 2.81 27.2 3.49 27.2C4.17 27.2 4.73 27.76 4.73 28.44Z"></path>
</svg>`
);
