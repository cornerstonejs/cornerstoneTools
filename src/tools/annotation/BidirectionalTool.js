import BaseAnnotationTool from '../base/BaseAnnotationTool.js';

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
//
import { state } from '../../store/index.js';
import lineSegDistance from './../../util/lineSegDistance.js';

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
        drawHandles: true,
        drawHandlesOnHover: true,
        additionalData: [],
      },
      svgCursor: bidirectionalCursor,
    };

    super(props, defaultProps);

    this.throttledUpdateCachedStats = throttle(this.updateCachedStats, 110);

    this.renderToolData = renderToolData.bind(this);
    this.addNewMeasurement = addNewMeasurement.bind(this);
    this._moveCallback = _moveCallback.bind(this);

    this.handleSelectedCallback = handleSelectedCallback.bind(this);
    this.handleSelectedMouseCallback = handleSelectedMouseCallback.bind(this);
    this.handleSelectedTouchCallback = handleSelectedTouchCallback.bind(this);
  }

  createNewMeasurement(mouseEventData) {
    const { x, y } = mouseEventData.currentPoints.image;
    // Create the measurement data for this tool with the end handle activated
    const measurementData = {
      toolType: this.name,
      isCreating: true,
      visible: true,
      active: true,
      invalidated: true,
      handles: {
        start: _getHandle(x, y, 0),
        end: _getHandle(x, y, 1, { active: true }),
        perpendicularStart: _getHandle(x, y, 2, { locked: true }),
        perpendicularEnd: _getHandle(x, y, 3),
        textBox: _getHandle(x - 50, y - 70, null, {
          highlight: false,
          hasMoved: true,
          active: false,
          movesIndependently: false,
          drawnIndependently: true,
          allowedOutsideImage: true,
          hasBoundingBox: true,
        }),
      },
      longestDiameter: 0,
      shortestDiameter: 0,
    };

    return measurementData;
  }

  /**
   *
   * @param {*} element
   * @param {*} annotation
   * @param {*} coords
   * @param {*} interactionType
   */
  pointNearTool(element, annotation, coords, interactionType = 'mouse') {
    if (!annotation || !annotation.handles || annotation.visible === false) {
      return false;
    }

    const distanceThreshold =
      interactionType === 'mouse' ? state.clickProximity : state.touchProximity;
    const {
      start,
      end,
      perpendicularStart,
      perpendicularEnd,
    } = annotation.handles;
    const isNearLine =
      start &&
      end &&
      lineSegDistance(element, start, end, coords) < distanceThreshold;
    const isNearPerpendicularLine =
      perpendicularStart &&
      perpendicularEnd &&
      lineSegDistance(element, perpendicularStart, perpendicularEnd, coords) <
        distanceThreshold;

    return isNearLine || isNearPerpendicularLine;
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

const _getHandle = (x, y, index, extraAttributes = {}) =>
  Object.assign(
    {
      x,
      y,
      index,
      drawnIndependently: false,
      allowedOutsideImage: false,
      highlight: true,
      active: false,
    },
    extraAttributes
  );
