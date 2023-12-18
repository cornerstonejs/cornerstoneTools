import external from './../../externalModules.js';
import BaseAnnotationTool from '../base/BaseAnnotationTool.js';
// State
import textStyle from './../../stateManagement/textStyle.js';
import {
  addToolState,
  getToolState,
  removeToolState,
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
  drawLine,
} from './../../drawing/index.js';
import drawHandles from './../../drawing/drawHandles.js';
import drawLinkedTextBox from './../../drawing/drawLinkedTextBox.js';
import lineSegDistance from './../../util/lineSegDistance.js';
import roundToDecimal from './../../util/roundToDecimal.js';
import EVENTS from './../../events.js';
import { cobbAngleCursor } from '../cursors/index.js';
import triggerEvent from '../../util/triggerEvent.js';
import throttle from '../../util/throttle';
import getPixelSpacing from '../../util/getPixelSpacing';
import { getModule } from '../../store/index';
import * as localization from '../../util/localization/localization.utils';

/**
 * @public
 * @class CobbAngleTool
 * @memberof Tools.Annotation
 * @classdesc Tool for measuring the angle between two straight lines.
 * @extends Tools.Base.BaseAnnotationTool
 */
export default class CobbAngleTool extends BaseAnnotationTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'CobbAngle',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      svgCursor: cobbAngleCursor,
      configuration: {
        drawHandles: true,
        drawHandlesOnHover: false,
        hideHandlesIfMoving: false,
        renderDashed: false,
      },
    };

    super(props, defaultProps);

    this.hasIncomplete = false;

    this.throttledUpdateCachedStats = throttle(this.updateCachedStats, 110);
  }

  createNewMeasurement(eventData) {
    // Create the measurement data for this tool with the end handle activated
    this.hasIncomplete = true;

    return {
      visible: true,
      active: true,
      color: undefined,
      invalidated: true,
      complete: false,
      value: '',
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
        start2: {
          x: eventData.currentPoints.image.x,
          y: eventData.currentPoints.image.y,
          highlight: true,
          active: false,
          drawnIndependently: true,
        },
        end2: {
          x: eventData.currentPoints.image.x + 1,
          y: eventData.currentPoints.image.y,
          highlight: true,
          active: false,
          drawnIndependently: true,
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
    if (data.visible === false) {
      return false;
    }

    if (this.hasIncomplete) {
      return false;
    }

    const seg1Near =
      lineSegDistance(element, data.handles.start, data.handles.end, coords) <
      25;
    const seg2Near =
      lineSegDistance(element, data.handles.start2, data.handles.end2, coords) <
      25;

    return seg1Near || seg2Near;
  }

  updateCachedStats(image, element, data) {
    const { rowPixelSpacing, colPixelSpacing } = getPixelSpacing(image);

    const dx1 =
      (Math.ceil(data.handles.start.x) - Math.ceil(data.handles.end.x)) *
      (colPixelSpacing || 1);
    const dy1 =
      (Math.ceil(data.handles.start.y) - Math.ceil(data.handles.end.y)) *
      (rowPixelSpacing || 1);
    const dx2 =
      (Math.ceil(data.handles.start2.x) - Math.ceil(data.handles.end2.x)) *
      (colPixelSpacing || 1);
    const dy2 =
      (Math.ceil(data.handles.start2.y) - Math.ceil(data.handles.end2.y)) *
      (rowPixelSpacing || 1);

    let alphaAngle = Math.acos(
      Math.abs(
        (dx1 * dx2 + dy1 * dy2) /
          (Math.sqrt(dx1 * dx1 + dy1 * dy1) * Math.sqrt(dx2 * dx2 + dy2 * dy2))
      )
    );

    alphaAngle *= 180 / Math.PI;
    const betaAngle = 180 - alphaAngle;

    data.alphaAngle = roundToDecimal(alphaAngle, 1);
    data.betaAngle = roundToDecimal(betaAngle, 1);

    data.invalidated = false;
  }

  renderToolData(evt) {
    const eventData = evt.detail;
    const {
      handleRadius,
      drawHandlesOnHover,
      hideHandlesIfMoving,
      renderDashed,
    } = this.configuration;
    // If we have no toolData for this element, return immediately as there is nothing to do
    const toolData = getToolState(evt.currentTarget, this.name);

    if (!toolData) {
      return;
    }

    // We have tool data for this element - iterate over each one and draw it
    const context = getNewContext(eventData.canvasContext.canvas);

    const lineWidth = toolStyle.getToolWidth();
    const lineDash = getModule('globalConfiguration').configuration.lineDash;
    const font = textStyle.getFont();
    const { element } = evt.detail;
    const image = external.cornerstone.getEnabledElement(element).image;
    const { rowPixelSpacing, colPixelSpacing } = getPixelSpacing(image);

    for (let i = 0; i < toolData.data.length; i++) {
      const data = toolData.data[i];

      if (data.visible === false) {
        continue;
      }

      if (!data.value) {
        data.value = this.textBoxText(data, rowPixelSpacing, colPixelSpacing);
      }

      draw(context, context => {
        setShadow(context, this.configuration);

        // Differentiate the color of activation tool
        const color = toolColors.getColorIfActive(data);

        const lineOptions = { color };

        if (renderDashed) {
          lineOptions.lineDash = lineDash;
        }

        drawLine(
          context,
          eventData.element,
          data.handles.start,
          data.handles.end,
          lineOptions
        );

        if (data.complete) {
          drawLine(
            context,
            eventData.element,
            data.handles.start2,
            data.handles.end2,
            lineOptions
          );
        }

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

        // Draw the text
        context.fillStyle = color;

        const text = data.value;

        if (!data.handles.textBox.hasMoved) {
          const textCoords = {
            x: (data.handles.start.x + data.handles.end.x) / 2,
            y: (data.handles.start.y + data.handles.end.y) / 2 - 10,
          };

          context.font = font;
          data.handles.textBox.x = textCoords.x;
          data.handles.textBox.y = textCoords.y;
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
      });
    }

    function textBoxAnchorPoints(handles) {
      return [handles.start, handles.start2, handles.end, handles.end2];
    }
  }

  getIncomplete(element) {
    const toolState = getToolState(element, this.name);

    if (toolState && Array.isArray(toolState.data)) {
      return toolState.data.find(({ complete }) => complete === false);
    }
  }

  addNewMeasurement(evt, interactionType) {
    evt.preventDefault();
    evt.stopPropagation();

    const eventData = evt.detail;

    let measurementData;
    let toMoveHandle;
    let doneMovingCallback = success => {
      // DoneMovingCallback for first measurement.
      if (!success) {
        removeToolState(element, this.name, measurementData);

        return;
      }
      const eventType = EVENTS.MEASUREMENT_COMPLETED;
      const eventData = {
        toolName: this.name,
        toolType: this.name, // Deprecation notice: toolType will be replaced by toolName
        element,
        measurementData,
      };

      triggerEvent(element, eventType, eventData);
    };

    // Search for incomplete measurements
    const element = evt.detail.element;
    const pendingMeasurement = this.getIncomplete(element);

    if (pendingMeasurement) {
      measurementData = pendingMeasurement;
      measurementData.complete = true;
      measurementData.handles.start2 = {
        x: eventData.currentPoints.image.x,
        y: eventData.currentPoints.image.y,
        drawnIndependently: false,
        highlight: true,
        active: false,
      };
      measurementData.handles.end2 = {
        x: eventData.currentPoints.image.x,
        y: eventData.currentPoints.image.y,
        drawnIndependently: false,
        highlight: true,
        active: true,
      };
      toMoveHandle = measurementData.handles.end2;
      this.hasIncomplete = false;
      doneMovingCallback = success => {
        // DoneMovingCallback for second measurement
        if (!success) {
          removeToolState(element, this.name, measurementData);

          return;
        }

        const eventType = EVENTS.MEASUREMENT_COMPLETED;
        const eventData = {
          toolName: this.name,
          toolType: this.name, // Deprecation notice: toolType will be replaced by toolName
          element,
          measurementData,
        };

        triggerEvent(element, eventType, eventData);
      };
    } else {
      measurementData = this.createNewMeasurement(eventData);
      addToolState(element, this.name, measurementData);
      toMoveHandle = measurementData.handles.end;
    }

    // Associate this data with this imageId so we can render it and manipulate it
    external.cornerstone.updateImage(element);

    moveNewHandle(
      eventData,
      this.name,
      measurementData,
      toMoveHandle,
      this.options,
      interactionType,
      doneMovingCallback
    );
  }

  onMeasureModified(ev) {
    const { element } = ev.detail;
    const image = external.cornerstone.getEnabledElement(element).image;

    if (ev.detail.toolName !== this.name) {
      return;
    }
    const data = ev.detail.measurementData;

    // Update textbox stats
    if (data.invalidated === true) {
      if (data.alphaAngle) {
        this.throttledUpdateCachedStats(image, element, data);
      } else {
        this.updateCachedStats(image, element, data);
      }
    }

    data.value = this.textBoxText(data);
  }

  /**
   * Static method which returns based on the given parameters the formatted text.
   * The text is in the same format as it is also drawn on the canvas in the end.
   **/
  static getToolTextFromToolState(
    context,
    isColorImage,
    toolState, // AlphaAngle, betaAngle
    modality,
    hasPixelSpacing,
    displayUncertainties,
    options = {}
  ) {
    const { alphaAngle, betaAngle } = toolState;

    return _createTextBoxContent({ alphaAngle, betaAngle });
  }

  textBoxText({ alphaAngle, betaAngle }) {
    return _createTextBoxContent({ alphaAngle, betaAngle });
  }

  activeCallback(element) {
    this.onMeasureModified = this.onMeasureModified.bind(this);
    element.addEventListener(
      EVENTS.MEASUREMENT_MODIFIED,
      this.onMeasureModified
    );
  }

  passiveCallback(element) {
    this.onMeasureModified = this.onMeasureModified.bind(this);
    element.addEventListener(
      EVENTS.MEASUREMENT_MODIFIED,
      this.onMeasureModified
    );
  }

  enabledCallback(element) {
    element.removeEventListener(
      EVENTS.MEASUREMENT_MODIFIED,
      this.onMeasureModified
    );
  }

  disabledCallback(element) {
    element.removeEventListener(
      EVENTS.MEASUREMENT_MODIFIED,
      this.onMeasureModified
    );
  }
}

function _createTextBoxContent({ alphaAngle, betaAngle }) {
  if (alphaAngle === undefined) {
    return '';
  }
  if (Number.isNaN(alphaAngle)) {
    return '';
  }

  return `${localization.localizeNumber(
    alphaAngle
  )}\u00B0, ${localization.localizeNumber(betaAngle)}\u00B0`;
}
