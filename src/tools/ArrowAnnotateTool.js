/* eslint no-loop-func: 0 */ // --> OFF
/* eslint class-methods-use-this: 0 */ // --> OFF
/* eslint no-alert: 0 */ // --> OFF
import external from '../externalModules.js';
import BaseAnnotationTool from '../base/BaseAnnotationTool.js';

import toolStyle from '../stateManagement/toolStyle.js';
import textStyle from '../stateManagement/textStyle.js';
import toolColors from '../stateManagement/toolColors.js';
import moveNewHandle from '../manipulators/moveNewHandle.js';
import moveNewHandleTouch from '../manipulators/moveNewHandleTouch.js';
import anyHandlesOutsideImage from '../manipulators/anyHandlesOutsideImage.js';
import pointInsideBoundingBox from '../util/pointInsideBoundingBox.js';
import lineSegDistance from '../util/lineSegDistance.js';
import {
  addToolState,
  removeToolState,
  getToolState
} from '../stateManagement/toolState.js';
import { state } from '../store/index.js';
import drawLinkedTextBox from '../drawing/drawLinkedTextBox.js';
import { getNewContext, draw, setShadow } from '../drawing/index.js';
import drawArrow from '../drawing/drawArrow.js';
import drawHandles from '../drawing/drawHandles.js';
import { textBoxWidth } from '../drawing/drawTextBox.js';

/**
 * @export @public @class
 * @name ArrowAnnotateTool
 * @classdesc Tool for annotating a region of an image with some text.
 * @extends BaseAnnotationTool
 */
export default class ArrowAnnotateTool extends BaseAnnotationTool {
  constructor (name = 'ArrowAnnotate') {
    super({
      name,
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: {
        getTextCallback,
        changeTextCallback,
        drawHandles: false,
        drawHandlesOnHover: true,
        arrowFirst: true
      }
    });

    this.preventNewMeasurement = false;
  }

  /**
   * Create the measurement data for this tool with the end handle activated
   *
   * @param {*} evt
   * @returns
   */
  createNewMeasurement (evt) {
    // Create the measurement data for this tool with the end handle activated
    return {
      visible: true,
      active: true,
      color: undefined,
      handles: {
        start: {
          x: evt.detail.currentPoints.image.x,
          y: evt.detail.currentPoints.image.y,
          highlight: true,
          active: false
        },
        end: {
          x: evt.detail.currentPoints.image.x,
          y: evt.detail.currentPoints.image.y,
          highlight: true,
          active: false
        },
        textBox: {
          active: false,
          hasMoved: false,
          movesIndependently: false,
          drawnIndependently: true,
          allowedOutsideImage: true,
          hasBoundingBox: true
        }
      }
    };
  }

  /**
   *
   *
   * @param {*} element
   * @param {*} data
   * @param {*} coords
   * @returns
   */
  pointNearTool (element, data, coords) {
    if (data.visible === false) {
      return false;
    }

    return (
      lineSegDistance(element, data.handles.start, data.handles.end, coords) <
      25
    );
  }

  /**
   *
   *
   * @param {*} evt
   * @returns
   */
  renderToolData (evt) {
    const { element, enabledElement } = evt.detail;

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

      draw(context, (context) => {
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
          drawHandlesIfActive: this.configuration.drawHandlesOnHover
        };

        if (this.configuration.drawHandles) {
          drawHandles(context, evt.detail, data.handles, color, handleOptions);
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
                y: handleEndCanvas.y - textHeight / 2
              };
            } else {
              // If the arrow is at the End position, the text should
              // Be placed near the Start position
              textCoords = {
                x: handleStartCanvas.x - textWidth / 2 - distance,
                y: handleStartCanvas.y - textHeight / 2
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

          drawLinkedTextBox(
            context,
            element,
            data.handles.textBox,
            text,
            data.handles,
            textBoxAnchorPoints,
            color,
            lineWidth,
            0,
            false
          );
        }
      });
    }

    function textBoxText (data) {
      return data.text;
    }

    function textBoxAnchorPoints (handles) {
      const midpoint = {
        x: (handles.start.x + handles.end.x) / 2,
        y: (handles.start.y + handles.end.y) / 2
      };

      return [handles.start, midpoint, handles.end];
    }
  }

  /**
   *
   *
   * @param {*} evt
   * @param {*} interactionType
   */
  addNewMeasurement (evt, interactionType) {
    const element = evt.detail.element;
    const measurementData = this.createNewMeasurement(evt);

    // Associate this data with this imageId so we can render it and manipulate it
    addToolState(element, this.name, measurementData);
    external.cornerstone.updateImage(element);

    // Since we are dragging to another place to drop the end point, we can just activate
    // The end point and let the moveHandle move it for us.
    const handleMover =
      interactionType === 'Mouse' ? moveNewHandle : moveNewHandleTouch;

    state.isToolLocked = true;
    handleMover(
      evt.detail,
      this.name,
      measurementData,
      measurementData.handles.end,
      () => {
        if (anyHandlesOutsideImage(evt.detail, measurementData.handles)) {
          // Delete the measurement
          removeToolState(element, this.name, measurementData);
        }

        if (measurementData.text === undefined) {
          this.configuration.getTextCallback((text) => {
            if (text) {
              measurementData.text = text;
            } else {
              removeToolState(element, this.name, measurementData);
            }

            measurementData.active = false;
            external.cornerstone.updateImage(element);
          });
        }

        state.isToolLocked = false;
        external.cornerstone.updateImage(element);
      }
    );
  }

  doubleClickCallback (evt) {
    if (evt.detail.buttons !== this.options.mouseButtonMask) {
      return;
    }

    return this._updateTextForNearbyAnnotation(evt);
  }

  touchPressCallback (evt) {
    return this._updateTextForNearbyAnnotation(evt);
  }

  _updateTextForNearbyAnnotation (evt) {
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

  _doneChangingTextCallback (element, data, updatedText, deleteTool) {
    if (deleteTool === true) {
      removeToolState(element, this.name, data);
    } else {
      data.text = updatedText;
    }

    data.active = false;
    external.cornerstone.updateImage(element);
  }
}

function getTextCallback (doneChangingTextCallback) {
  doneChangingTextCallback(prompt('Enter your annotation:'));
}

function changeTextCallback (data, eventData, doneChangingTextCallback) {
  doneChangingTextCallback(prompt('Change your annotation:'));
}
