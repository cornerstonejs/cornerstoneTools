/* eslint no-alert: 0 */
import external from './../../externalModules.js';
import BaseAnnotationTool from '../base/BaseAnnotationTool.js';

import EVENTS from './../../events.js';
import triggerEvent from './../../util/triggerEvent.js';

// State
import textStyle from './../../stateManagement/textStyle.js';
import textColors from './../../stateManagement/textColors.js';
import {
  addToolState,
  removeToolState,
  getToolState,
} from './../../stateManagement/toolState.js';
import toolStyle from './../../stateManagement/toolStyle.js';
import toolColors from './../../stateManagement/toolColors.js';

// Manipulators
import { moveNewHandle } from './../../manipulators/index.js';

// Util
import pointInsideBoundingBox from './../../util/pointInsideBoundingBox.js';
import lineSegDistance from './../../util/lineSegDistance.js';

// Drawing
import drawLinkedTextBox from './../../drawing/drawLinkedTextBox.js';
import { getNewContext, draw, setShadow } from './../../drawing/index.js';
import drawArrow from './../../drawing/drawArrow.js';
import drawHandles from './../../drawing/drawHandles.js';
import { textBoxWidth } from './../../drawing/drawTextBox.js';
import { arrowAnnotateCursor } from '../cursors/index.js';

// Logger
import { getLogger } from '../../util/logger.js';

const logger = getLogger('tools:annotation:ArrowAnnotateTool');

/**
 * @public
 * @class ArrowAnnotateTool
 * @memberof Tools.Annotation
 * @classdesc Create and position an arrow and label
 * @extends Tools.Base.BaseAnnotationTool
 */
export default class ArrowAnnotateTool extends BaseAnnotationTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'ArrowAnnotate',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: {
        // hideTextBox: false,
        // textBoxOnHover: false,
      },
      svgCursor: arrowAnnotateCursor,
    };

    Object.assign(defaultProps.configuration, defaultArrowConfiguration());

    super(props, defaultProps);
    this.preventNewMeasurement = false;
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

    // Create the measurement data for this tool with the end handle activated
    return {
      visible: true,
      active: true,
      color: config.color,
      activeColor: config.activeColor,
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
          active: false,
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

  pointNearTool(element, data, coords) {
    if (data.visible === false) {
      return false;
    }

    return (
      lineSegDistance(element, data.handles.start, data.handles.end, coords) <
      25
    );
  }

  updateCachedStats() {
    // Implementing to satisfy BaseAnnotationTool
  }

  renderToolData(evt) {
    const { element, enabledElement } = evt.detail;
    const { handleRadius, drawHandlesOnHover } = this.configuration;

    // If we have no toolData for this element, return immediately as there is nothing to do
    const toolData = getToolState(element, this.name);

    if (!toolData) {
      return;
    }

    // We have tool data for this element - iterate over each one and draw it
    const canvas = evt.detail.canvasContext.canvas;
    const context = getNewContext(canvas);

    const lineWidth = toolStyle.getToolWidth();

    for (let i = 0; i < toolData.data.length; i++) {
      const data = toolData.data[i];

      if (data.visible === false) {
        continue;
      }

      draw(context, context => {
        setShadow(context, this.configuration);

        const color = toolColors.getColorIfActive(data);

        // Draw the arrow
        const handleStartCanvas = external.cornerstone.pixelToCanvas(
          element,
          data.handles.start
        );
        const handleEndCanvas = external.cornerstone.pixelToCanvas(
          element,
          data.handles.end
        );

        // Config.arrowFirst = false;
        if (this.configuration.arrowFirst) {
          drawArrow(
            context,
            handleEndCanvas,
            handleStartCanvas,
            color,
            lineWidth
          );
        } else {
          drawArrow(
            context,
            handleStartCanvas,
            handleEndCanvas,
            color,
            lineWidth
          );
        }

        const handleOptions = {
          color,
          handleRadius,
          drawHandlesIfActive: drawHandlesOnHover,
        };

        if (this.configuration.drawHandles) {
          drawHandles(context, evt.detail, data.handles, handleOptions);
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

        const text = textBoxText(data);

        // Draw the text
        if (text && text !== '') {
          // Calculate the text coordinates.
          const padding = 5;
          const textWidth = textBoxWidth(context, text, padding);
          const textHeight = textStyle.getFontSize() + 10;

          let distance = Math.max(textWidth, textHeight) / 2 + 5;

          if (handleEndCanvas.x < handleStartCanvas.x) {
            distance = -distance;
          }

          if (!data.handles.textBox.hasMoved) {
            let textCoords;

            if (this.configuration.arrowFirst) {
              textCoords = {
                x: handleEndCanvas.x - textWidth / 2 + distance,
                y: handleEndCanvas.y - textHeight / 2,
              };
            } else {
              // If the arrow is at the End position, the text should
              // Be placed near the Start position
              textCoords = {
                x: handleStartCanvas.x - textWidth / 2 - distance,
                y: handleStartCanvas.y - textHeight / 2,
              };
            }

            const transform = external.cornerstone.internal.getTransform(
              enabledElement
            );

            transform.invert();

            const coords = transform.transformPoint(textCoords.x, textCoords.y);

            data.handles.textBox.x = coords.x;
            data.handles.textBox.y = coords.y;
          }

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
            0,
            false
          );
        }
      });
    }

    function textBoxText(data) {
      return data.text;
    }

    function textBoxAnchorPoints(handles) {
      const midpoint = {
        x: (handles.start.x + handles.end.x) / 2,
        y: (handles.start.y + handles.end.y) / 2,
      };

      return [handles.start, midpoint, handles.end];
    }
  }

  addNewMeasurement(evt, interactionType) {
    const element = evt.detail.element;
    const measurementData = this.createNewMeasurement(evt.detail);

    // Associate this data with this imageId so we can render it and manipulate it
    addToolState(element, this.name, measurementData);
    external.cornerstone.updateImage(element);

    moveNewHandle(
      evt.detail,
      this.name,
      measurementData,
      measurementData.handles.end,
      this.options,
      interactionType,
      success => {
        if (success) {
          if (measurementData.text === undefined) {
            this.configuration.getTextCallback(text => {
              if (text) {
                measurementData.text = text;
              } else {
                removeToolState(element, this.name, measurementData);
              }

              measurementData.active = false;
              external.cornerstone.updateImage(element);

              triggerEvent(element, EVENTS.MEASUREMENT_MODIFIED, {
                toolName: this.name,
                toolType: this.name, // Deprecation notice: toolType will be replaced by toolName
                element,
                measurementData,
              });
            }, evt.detail);
          }
        } else {
          removeToolState(element, this.name, measurementData);
        }

        external.cornerstone.updateImage(element);

        const modifiedEventData = {
          toolName: this.name,
          toolType: this.name, // Deprecation notice: toolType will be replaced by toolName
          element,
          measurementData,
        };

        triggerEvent(element, EVENTS.MEASUREMENT_COMPLETED, modifiedEventData);
      }
    );
  }

  doubleClickCallback(evt) {
    return this._updateTextForNearbyAnnotation(evt);
  }

  touchPressCallback(evt) {
    return this._updateTextForNearbyAnnotation(evt);
  }

  _updateTextForNearbyAnnotation(evt) {
    const element = evt.detail.element;
    const coords = evt.detail.currentPoints.canvas;
    const toolState = getToolState(element, this.name);

    if (!toolState) {
      return false;
    }

    for (let i = 0; i < toolState.data.length; i++) {
      const data = toolState.data[i];

      if (
        this.pointNearTool(element, data, coords) ||
        pointInsideBoundingBox(data.handles.textBox, coords)
      ) {
        data.active = true;
        external.cornerstone.updateImage(element);

        // Allow relabelling via a callback
        this.configuration.changeTextCallback(
          data,
          evt.detail,
          this._doneChangingTextCallback.bind(this, element, data)
        );

        evt.stopImmediatePropagation();
        evt.preventDefault();
        evt.stopPropagation();

        return true;
      }
    }
  }

  _doneChangingTextCallback(element, measurementData, updatedText, deleteTool) {
    if (deleteTool === true) {
      removeToolState(element, this.name, measurementData);
    } else {
      measurementData.text = updatedText;
    }

    measurementData.active = false;
    external.cornerstone.updateImage(element);

    triggerEvent(element, EVENTS.MEASUREMENT_MODIFIED, {
      toolName: this.name,
      toolType: this.name, // Deprecation notice: toolType will be replaced by toolName
      element,
      measurementData,
    });
  }
}

function getTextCallback(doneChangingTextCallback) {
  doneChangingTextCallback(prompt('Enter your annotation:'));
}

function changeTextCallback(data, eventData, doneChangingTextCallback) {
  doneChangingTextCallback(prompt('Change your annotation:'));
}

function defaultArrowConfiguration() {
  return {
    getTextCallback,
    changeTextCallback,
    drawHandles: false,
    drawHandlesOnHover: true,
    arrowFirst: true,
  };
}
