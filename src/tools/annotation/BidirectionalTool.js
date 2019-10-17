import BaseAnnotationTool from '../base/BaseAnnotationTool.js';

import createNewMeasurement from './bidirectionalTool/createNewMeasurement.js';
import pointNearTool from './bidirectionalTool/pointNearTool.js';
import renderToolData from './bidirectionalTool/renderToolData.js';
import addNewMeasurement from './bidirectionalTool/addNewMeasurement.js';
import _moveCallback from './bidirectionalTool/mouseMoveCallback.js';
import handleSelectedCallback from './bidirectionalTool/handleSelectedCallback.js';
import handleSelectedMouseCallback from './bidirectionalTool/handleSelectedMouseCallback.js';
import handleSelectedTouchCallback from './bidirectionalTool/handleSelectedTouchCallback.js';
import { bidirectionalCursor } from '../cursors/index.js';
import throttle from '../../util/throttle';
import getPixelSpacing from '../../util/getPixelSpacing';
import calculateLongestAndShortestDiameters from './bidirectionalTool/utils/calculateLongestAndShortestDiameters';

import EVENTS from '../../events.js';
import { getToolState } from '../../stateManagement/toolState.js';

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

    this.throttledUpdateCachedStats = throttle(this.updateCachedStats, 110);

    this.createNewMeasurement = createNewMeasurement.bind(this);
    this.pointNearTool = pointNearTool.bind(this);
    this.renderToolData = renderToolData.bind(this);
    this.addNewMeasurement = addNewMeasurement.bind(this);
    this._moveCallback = _moveCallback.bind(this);

    this.handleSelectedCallback = handleSelectedCallback.bind(this);
    this.handleSelectedMouseCallback = handleSelectedMouseCallback.bind(this);
    this.handleSelectedTouchCallback = handleSelectedTouchCallback.bind(this);
  }

  preTouchStartCallback(evt) {
    console.log('>>>>TOUCH_START_PRE', evt);
    const { element, currentPoints } = evt.detail;
    const lastCanvasPoints = currentPoints.canvas;

    const touchEndCallback = evt => {
      const { element, currentPoints } = evt.detail;
      const isEqualX = currentPoints.canvas.x === lastCanvasPoints.x;
      const isEqualY = currentPoints.canvas.y === lastCanvasPoints.y;

      element.removeEventListener(EVENTS.TOUCH_END, touchEndCallback);

      if (isEqualX && isEqualY) {
        const toolState = getToolState(element, this.name);
        const toolData = toolState.data.find(data =>
          this.pointNearTool(element, data, lastCanvasPoints)
        );

        console.log('>>>>EQUAL', evt, toolState, toolData);

        toolState.data.forEach(data => {
          if (data !== toolData) {
            data.activeTouch = false;
          }
        });

        if (toolData) {
          toolData.activeTouch = !toolData.activeTouch;
        }
      }
    };

    element.addEventListener(EVENTS.TOUCH_END, touchEndCallback);

    return false;
  }

  updateCachedStats(image, element, data) {
    const pixelSpacing = getPixelSpacing(image);
    const {
      longestDiameter,
      shortestDiameter,
    } = calculateLongestAndShortestDiameters(data, pixelSpacing);

    // Set measurement text to show lesion table
    data.longestDiameter = longestDiameter;
    data.shortestDiameter = shortestDiameter;
    data.invalidated = false;
  }
}
