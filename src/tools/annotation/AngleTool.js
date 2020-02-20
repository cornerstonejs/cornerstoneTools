import external from './../../externalModules.js';
import BaseAnnotationTool from '../base/BaseAnnotationTool.js';
// State
import {
  addToolState,
  getToolState,
} from './../../stateManagement/toolState.js';
import toolStyle from './../../stateManagement/toolStyle.js';
import toolColors from './../../stateManagement/toolColors.js';
// Manipulators
import { moveNewHandle } from './../../manipulators/index.js';
// Drawing
import {
  getNewContext,
  draw,
  setShadow,
  drawJoinedLines,
} from './../../drawing/index.js';
import drawLinkedTextBox from './../../drawing/drawLinkedTextBox.js';
import { textBoxWidth } from './../../drawing/drawTextBox.js';
import drawHandles from './../../drawing/drawHandles.js';
import lineSegDistance from './../../util/lineSegDistance.js';
import roundToDecimal from './../../util/roundToDecimal.js';
import { angleCursor } from '../cursors/index.js';
import triggerEvent from '../../util/triggerEvent.js';
import EVENTS from '../../events.js';
import getPixelSpacing from '../../util/getPixelSpacing';
import throttle from '../../util/throttle';

/**
 * @public
 * @class AngleTool
 * @memberof Tools.Annotation
 * @classdesc Create and position an angle by placing three consecutive points.
 * @extends Tools.Base.BaseAnnotationTool
 * @hideconstructor
 *
 * @param {ToolConfiguration} [props={}]
 */
export default class AngleTool extends BaseAnnotationTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'Angle',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      svgCursor: angleCursor,
      configuration: {
        drawHandles: true,
      },
    };

    super(props, defaultProps);

    this.preventNewMeasurement = false;

    this.throttledUpdateCachedStats = throttle(this.updateCachedStats, 110);
  }

  createNewMeasurement(eventData) {
    // Create the measurement data for this tool with the end handle activated
    return {
      visible: true,
      active: true,
      color: undefined,
      invalidated: true,
      handles: {
        start: {
          x: eventData.currentPoints.image.x,
          y: eventData.currentPoints.image.y,
          highlight: true,
          active: false,
        },
        middle: {
          x: eventData.currentPoints.image.x,
          y: eventData.currentPoints.image.y,
          highlight: true,
          active: true,
        },
        end: {
          x: eventData.currentPoints.image.x,
          y: eventData.currentPoints.image.y,
          highlight: true,
          active: false,
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

  pointNearTool(element, data, coords) {
    if (data.visible === false) {
      return false;
    }

    return (
      lineSegDistance(
        element,
        data.handles.start,
        data.handles.middle,
        coords
      ) < 25 ||
      lineSegDistance(element, data.handles.middle, data.handles.end, coords) <
        25
    );
  }

  updateCachedStats(image, element, data) {
    const { rowPixelSpacing, colPixelSpacing } = getPixelSpacing(image);

    const sideA = {
      x: (data.handles.middle.x - data.handles.start.x) * colPixelSpacing,
      y: (data.handles.middle.y - data.handles.start.y) * rowPixelSpacing,
    };

    const sideB = {
      x: (data.handles.end.x - data.handles.middle.x) * colPixelSpacing,
      y: (data.handles.end.y - data.handles.middle.y) * rowPixelSpacing,
    };

    const sideC = {
      x: (data.handles.end.x - data.handles.start.x) * colPixelSpacing,
      y: (data.handles.end.y - data.handles.start.y) * rowPixelSpacing,
    };

    const sideALength = length(sideA);
    const sideBLength = length(sideB);
    const sideCLength = length(sideC);

    // Cosine law
    let angle = Math.acos(
      (Math.pow(sideALength, 2) +
        Math.pow(sideBLength, 2) -
        Math.pow(sideCLength, 2)) /
        (2 * sideALength * sideBLength)
    );

    angle *= 180 / Math.PI;

    data.rAngle = roundToDecimal(angle, 2);
    data.invalidated = false;
  }

  renderToolData(evt) {
    const eventData = evt.detail;
    const enabledElement = eventData.enabledElement;
    const { handleRadius, drawHandlesOnHover } = this.configuration;
    // If we have no toolData for this element, return immediately as there is nothing to do
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
        setShadow(context, this.configuration);

        // Differentiate the color of activation tool
        const color = toolColors.getColorIfActive(data);

        const handleStartCanvas = external.cornerstone.pixelToCanvas(
          eventData.element,
          data.handles.start
        );
        const handleMiddleCanvas = external.cornerstone.pixelToCanvas(
          eventData.element,
          data.handles.middle
        );

        drawJoinedLines(
          context,
          eventData.element,
          data.handles.start,
          [data.handles.middle, data.handles.end],
          { color }
        );

        // Draw the handles
        const handleOptions = {
          color,
          handleRadius,
          drawHandlesIfActive: drawHandlesOnHover,
        };

        if (this.configuration.drawHandles) {
          drawHandles(context, eventData, data.handles, handleOptions);
        }

        // Update textbox stats
        if (data.invalidated === true) {
          if (data.rAngle) {
            this.throttledUpdateCachedStats(image, element, data);
          } else {
            this.updateCachedStats(image, element, data);
          }
        }

        if (data.rAngle) {
          const text = textBoxText(data, rowPixelSpacing, colPixelSpacing);

          const distance = 15;

          let textCoords;

          if (!data.handles.textBox.hasMoved) {
            textCoords = {
              x: handleMiddleCanvas.x,
              y: handleMiddleCanvas.y,
            };

            const padding = 5;
            const textWidth = textBoxWidth(context, text, padding);

            if (handleMiddleCanvas.x < handleStartCanvas.x) {
              textCoords.x -= distance + textWidth + 10;
            } else {
              textCoords.x += distance;
            }

            const transform = external.cornerstone.internal.getTransform(
              enabledElement
            );

            transform.invert();

            const coords = transform.transformPoint(textCoords.x, textCoords.y);

            data.handles.textBox.x = coords.x;
            data.handles.textBox.y = coords.y;
          }

          drawLinkedTextBox(
            context,
            eventData.element,
            data.handles.textBox,
            text,
            data.handles,
            textBoxAnchorPoints,
            color,
            lineWidth,
            0,
            true
          );
        }
      });
    }

    function textBoxText(data, rowPixelSpacing, colPixelSpacing) {
      const suffix = !rowPixelSpacing || !colPixelSpacing ? ' (isotropic)' : '';
      const str = '00B0'; // Degrees symbol

      return (
        data.rAngle.toString() + String.fromCharCode(parseInt(str, 16)) + suffix
      );
    }

    function textBoxAnchorPoints(handles) {
      return [handles.start, handles.middle, handles.end];
    }
  }

  addNewMeasurement(evt, interactionType) {
    if (this.preventNewMeasurement) {
      return;
    }

    this.preventNewMeasurement = true;
    evt.preventDefault();
    evt.stopPropagation();

    const eventData = evt.detail;
    const measurementData = this.createNewMeasurement(eventData);
    const element = evt.detail.element;

    // Associate this data with this imageId so we can render it and manipulate it
    addToolState(element, this.name, measurementData);
    external.cornerstone.updateImage(element);

    // Step 1, create start and second middle.
    moveNewHandle(
      eventData,
      this.name,
      measurementData,
      measurementData.handles.middle,
      this.options,
      interactionType,
      () => {
        measurementData.active = false;
        measurementData.handles.end.active = true;

        external.cornerstone.updateImage(element);

        // Step 2, create end.
        moveNewHandle(
          eventData,
          this.name,
          measurementData,
          measurementData.handles.end,
          this.options,
          interactionType,
          () => {
            measurementData.active = false;
            this.preventNewMeasurement = false;
            external.cornerstone.updateImage(element);
          }
        );
      }
    );
  }
}

function length(vector) {
  return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
}
