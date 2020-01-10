import BaseAnnotationTool from '../base/BaseAnnotationTool.js';

// State
import textColors from './../../stateManagement/textColors.js';
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
import getPixelSpacing from '../../util/getPixelSpacing';
import throttle from '../../util/throttle';

// Logger
import { getLogger } from '../../util/logger.js';

const logger = getLogger('tools:annotation:LengthTool');

/**
 * @public
 * @class LengthTool
 * @memberof Tools.Annotation
 * @classdesc Tool for measuring distances.
 * @extends Tools.Base.BaseAnnotationTool
 */
export default class LengthTool extends BaseAnnotationTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'Length',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: {
        // hideTextBox: false,
        // textBoxOnHover: false,
      },
      svgCursor: lengthCursor,
      configuration: {
        drawHandles: true,
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

    const config = this.configuration || {};

    return {
      visible: true,
      active: true,
      color: config.color,
      activeColor: config.activeColor,
      invalidated: true,
      handles: {
        start: {
          x: eventData.currentPoints.image.x,
          y: eventData.currentPoints.image.y,
          highlight: true,
          active: false,
        },
        end: {
          x: eventData.currentPoints.image.x,
          y: eventData.currentPoints.image.y,
          highlight: true,
          active: true,
        },
        textBox: {
          active: false,
          color: undefined,
          activeColor: undefined,
          hasMoved: false,
          movesIndependently: false,
          drawnIndependently: true,
          allowedOutsideImage: true,
          hasBoundingBox: true,
          hide: false,
          hover: false,
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
    const { rowPixelSpacing, colPixelSpacing } = getPixelSpacing(image);

    // Set rowPixelSpacing and columnPixelSpacing to 1 if they are undefined (or zero)
    const dx =
      (data.handles.end.x - data.handles.start.x) * (colPixelSpacing || 1);
    const dy =
      (data.handles.end.y - data.handles.start.y) * (rowPixelSpacing || 1);

    // Calculate the length, and create the text variable with the millimeters or pixels suffix
    const length = Math.sqrt(dx * dx + dy * dy);

    // Store the length inside the tool for outside access
    data.length = length;
    data.invalidated = false;
  }

  renderToolData(evt) {
    const eventData = evt.detail;
    const { handleRadius, drawHandlesOnHover } = this.configuration;
    const toolData = getToolState(evt.currentTarget, this.name);

    if (!toolData) {
      return;
    }

    // We have tool data for this element - iterate over each one and draw it
    const context = getNewContext(eventData.canvasContext.canvas);
    const { image, element } = eventData;
    const { rowPixelSpacing, colPixelSpacing } = getPixelSpacing(image);

    const lineWidth = toolStyle.getToolWidth();

    for (let i = 0; i < toolData.data.length; i++) {
      const data = toolData.data[i];

      if (data.visible === false) {
        continue;
      }

      draw(context, context => {
        // Configurable shadow
        setShadow(context, this.configuration);

        const color = toolColors.getColorIfActive(data);

        // Draw the measurement line
        drawLine(context, element, data.handles.start, data.handles.end, {
          color,
        });

        // Draw the handles
        const handleOptions = {
          color,
          handleRadius,
          drawHandlesIfActive: drawHandlesOnHover,
        };

        if (this.configuration.drawHandles) {
          drawHandles(context, eventData, data.handles, handleOptions);
        }

        // Hide TextBox
        if (this.configuration.hideTextBox || data.handles.textBox.hide) {
          return;
        }
        // TextBox OnHover
        data.handles.textBox.hasBoundingBox =
          !this.configuration.textBoxOnHover && !data.handles.textBox.hover;
        if (
          (this.configuration.textBoxOnHover || data.handles.textBox.hover) &&
          !data.active
        ) {
          return;
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

        const text = textBoxText(data, rowPixelSpacing, colPixelSpacing);

        // Text Colors
        const textColor = textColors.getColorIfActive(data);

        drawLinkedTextBox(
          context,
          element,
          data.handles.textBox,
          text,
          data.handles,
          textBoxAnchorPoints,
          textColor,
          lineWidth,
          xOffset,
          true
        );
      });
    }

    function textBoxText(data, rowPixelSpacing, colPixelSpacing) {
      // Set the length text suffix depending on whether or not pixelSpacing is available
      let suffix = 'mm';

      if (!rowPixelSpacing || !colPixelSpacing) {
        suffix = 'pixels';
      }

      data.unit = suffix;

      return `${data.length.toFixed(2)} ${suffix}`;
    }

    function textBoxAnchorPoints(handles) {
      const midpoint = {
        x: (handles.start.x + handles.end.x) / 2,
        y: (handles.start.y + handles.end.y) / 2,
      };

      return [handles.start, midpoint, handles.end];
    }
  }
}
