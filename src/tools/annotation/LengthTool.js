import BaseMeasurementTool from '../base/BaseMeasurementTool.js';
// State
import { getToolState } from './../../stateManagement/toolState.js';
import toolStyle from './../../stateManagement/toolStyle.js';
import toolColors from './../../stateManagement/toolColors.js';
// Drawing
import {
  getNewContext,
  draw,
  setShadow,
  drawLine,
} from './../../drawing/index.js';
import drawLinkedTextBox from './../../drawing/drawLinkedTextBox.js';
import drawHandles from './../../drawing/drawHandles.js';
import lineSegDistance from './../../util/lineSegDistance.js';
import { lengthCursor } from '../cursors/index.js';
import { getLogger } from '../../util/logger.js';
import getPixelSpacing from '../../util/pixelSpacing/getPixelSpacing';
import throttle from '../../util/throttle';
import { getModule } from '../../store/index';
import * as measurementUncertainty from '../../util/measurementUncertaintyTool.js';
import roundToDecimal from '../../util/roundToDecimal.js';
import { formatLenght } from '../../util/formatMeasurement';
import Decimal from 'decimal.js';

const logger = getLogger('tools:annotation:LengthTool');

/**
 * @public
 * @class LengthTool
 * @memberof Tools.Annotation
 * @classdesc Tool for measuring distances.
 * @extends Tools.Base.BaseMeasurementTool
 */
export default class LengthTool extends BaseMeasurementTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'Length',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      svgCursor: lengthCursor,
      configuration: {
        drawHandles: true,
        drawHandlesOnHover: false,
        hideHandlesIfMoving: false,
        renderDashed: false,
        digits: 2,
      },
    };

    super(props, defaultProps);

    this.throttledUpdateCachedStats = throttle(this.updateCachedStats, 110);
  }

  createNewMeasurement(eventData) {
    const goodEventData =
      eventData && eventData.currentPoints && eventData.currentPoints.image;

    if (!goodEventData) {
      logger.error(
        `required eventData not supplied to tool ${this.name}'s createNewMeasurement`
      );

      return;
    }

    const { x, y } = eventData.currentPoints.image;

    return {
      visible: true,
      active: true,
      color: undefined,
      invalidated: true,
      handles: {
        start: {
          x,
          y,
          highlight: true,
          active: false,
        },
        end: {
          x,
          y,
          highlight: true,
          active: true,
        },
        textBox: {
          active: false,
          hasMoved: false,
          movesIndependently: false,
          drawnIndependently: true,
          allowedOutsideImage: true,
          hasBoundingBox: true,
        },
      },
    };
  }

  /**
   *
   *
   * @param {*} element
   * @param {*} data
   * @param {*} coords
   * @returns {Boolean}
   */
  pointNearTool(element, data, coords) {
    const hasStartAndEndHandles =
      data && data.handles && data.handles.start && data.handles.end;
    const validParameters = hasStartAndEndHandles;

    if (!validParameters) {
      logger.warn(
        `invalid parameters supplied to tool ${this.name}'s pointNearTool`
      );

      return false;
    }

    if (data.visible === false) {
      return false;
    }

    return (
      lineSegDistance(element, data.handles.start, data.handles.end, coords) <
      25
    );
  }

  updateCachedStats(image, element, data) {
    const { rowPixelSpacing, colPixelSpacing } = getPixelSpacing(image, data);

    // Set rowPixelSpacing and columnPixelSpacing to 1 if they are undefined (or zero)
    const dx =
      (data.handles.end.x - data.handles.start.x) * (colPixelSpacing || 1);
    const dy =
      (data.handles.end.y - data.handles.start.y) * (rowPixelSpacing || 1);

    // Calculate the length, and create the text variable with the millimeters or pixels suffix
    const length = Math.sqrt(dx * dx + dy * dy);

    const uncertainty = measurementUncertainty.getPixelDiagonal(
      colPixelSpacing,
      rowPixelSpacing
    );

    const roundedLength = colPixelSpacing
      ? measurementUncertainty.roundValueBasedOnUncertainty(length, uncertainty)
      : roundToDecimal(length, 1);

    const roundedUncertainty = colPixelSpacing
      ? measurementUncertainty.roundValueBasedOnUncertainty(
          uncertainty,
          uncertainty
        )
      : roundToDecimal(uncertainty, 1);

    // Store the length inside the tool for outside access
    data.length = new Decimal(roundedLength);
    data.uncertainty = new Decimal(roundedUncertainty);
    data.invalidated = false;
  }

  renderToolData(evt) {
    const eventData = evt.detail;
    const {
      handleRadius,
      drawHandlesOnHover,
      hideHandlesIfMoving,
      renderDashed,
      digits,
    } = this.configuration;
    const toolData = getToolState(evt.currentTarget, this.name);

    if (!toolData) {
      return;
    }

    // We have tool data for this element - iterate over each one and draw it
    const context = getNewContext(eventData.canvasContext.canvas);
    const { image, element } = eventData;

    const lineWidth = toolStyle.getToolWidth();
    const lineDash = getModule('globalConfiguration').configuration.lineDash;

    for (let i = 0; i < toolData.data.length; i++) {
      const data = toolData.data[i];

      if (data.visible === false) {
        continue;
      }

      draw(context, context => {
        // Configurable shadow
        setShadow(context, this.configuration);

        const color = toolColors.getColorIfActive(data);

        const lineOptions = { color };

        if (renderDashed) {
          lineOptions.lineDash = lineDash;
        }

        // Draw the measurement line
        drawLine(
          context,
          element,
          data.handles.start,
          data.handles.end,
          lineOptions
        );

        // Draw the handles
        const handleOptions = {
          color,
          handleRadius,
          drawHandlesIfActive: drawHandlesOnHover,
          hideHandlesIfMoving,
        };

        if (this.configuration.drawHandles) {
          drawHandles(context, eventData, data.handles, handleOptions);
        }

        if (!data.handles.textBox.hasMoved) {
          const coords = {
            x: Math.max(data.handles.start.x, data.handles.end.x),
          };

          // Depending on which handle has the largest x-value,
          // Set the y-value for the text box
          if (coords.x === data.handles.start.x) {
            coords.y = data.handles.start.y;
          } else {
            coords.y = data.handles.end.y;
          }

          data.handles.textBox.x = coords.x;
          data.handles.textBox.y = coords.y;
        }

        // Move the textbox slightly to the right and upwards
        // So that it sits beside the length tool handle
        const xOffset = 10;

        // Update textbox stats
        if (data.invalidated === true) {
          if (data.length) {
            this.throttledUpdateCachedStats(image, element, data);
          } else {
            this.updateCachedStats(image, element, data);
          }
        }

        const { unit } = getPixelSpacing(image, data);

        const text = textBoxText(data, unit, this.displayUncertainties);

        drawLinkedTextBox(
          context,
          element,
          data.handles.textBox,
          text,
          data.handles,
          textBoxAnchorPoints,
          color,
          lineWidth,
          xOffset,
          true
        );
      });
    }

    // - SideEffect: Updates annotation 'suffix'
    function textBoxText(annotation, unit, displayUncertainties) {
      return _createTextBoxContent(annotation, unit, displayUncertainties);
    }

    function textBoxAnchorPoints(handles) {
      const midpoint = {
        x: (handles.start.x + handles.end.x) / 2,
        y: (handles.start.y + handles.end.y) / 2,
      };

      return [handles.start, midpoint, handles.end];
    }
  }

  /**
   * Static method which returns based on the given parameters the formatted text.
   * The text is in the same format as it is also drawn on the canvas in the end.
   **/
  static getToolTextFromToolState(
    context,
    isColorImage,
    toolState, // Length
    modality,
    unit,
    displayUncertainties,
    options = {}
  ) {
    return _createTextBoxContent(toolState, unit, displayUncertainties);
  }
}

/**
 * Attempts to sanitize a value by casting as a number; if unable to cast,
 * we return `undefined`
 *
 * @param {*} value
 * @returns a number or undefined
 */
function _sanitizeMeasuredValue(value) {
  const parsedValue = Number(value);
  const isNumber = !isNaN(parsedValue);

  return isNumber ? parsedValue : undefined;
}

function _createTextBoxContent(annotation, unit, displayUncertainties) {
  const measuredValue = _sanitizeMeasuredValue(annotation.length);

  return formatLenght(
    measuredValue,
    unit,
    annotation.uncertainty,
    displayUncertainties
  );
}
