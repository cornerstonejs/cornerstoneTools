/* eslint no-loop-func: 0 */ // --> OFF
/* eslint class-methods-use-this: 0 */ // --> OFF
/* eslint no-alert: 0 */ // --> OFF
import external from './../externalModules.js';
import baseAnnotationTool from './../base/baseAnnotationTool.js';

import toolStyle from '../stateManagement/toolStyle.js';
import textStyle from '../stateManagement/textStyle.js';
import toolColors from '../stateManagement/toolColors.js';
import drawHandles from '../manipulators/drawHandles.js';
import drawArrow from '../util/drawArrow.js';
import moveNewHandle from '../manipulators/moveNewHandle.js';
import moveNewHandleTouch from '../manipulators/moveNewHandleTouch.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';
import anyHandlesOutsideImage from '../manipulators/anyHandlesOutsideImage.js';
import pointInsideBoundingBox from '../util/pointInsideBoundingBox.js';
import drawLinkedTextBox from '../util/drawLinkedTextBox.js';
import {
  addToolState,
  removeToolState,
  getToolState
} from '../stateManagement/toolState.js';
import lineSegDistance from '../util/lineSegDistance.js';
import { getNewContext, draw, setShadow } from '../util/drawing.js';

const cornerstone = external.cornerstone;

export default class extends baseAnnotationTool {
  constructor (name = 'arrowAnnotate') {
    super({
      name,
      supportedInteractionTypes: ['mouse', 'touch'],
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
    const font = textStyle.getFont();

    for (let i = 0; i < toolData.data.length; i++) {
      const data = toolData.data[i];

      if (data.visible === false) {
        continue;
      }

      draw(context, (context) => {
        setShadow(context, this.configuration);

        const color = toolColors.getColorIfActive(data);

        // Draw the arrow
        const handleStartCanvas = cornerstone.pixelToCanvas(
          element,
          data.handles.start
        );
        const handleEndCanvas = cornerstone.pixelToCanvas(
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
          context.font = font;

          // Calculate the text coordinates.
          const textWidth = context.measureText(text).width + 10;
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

            const transform = cornerstone.internal.getTransform(enabledElement);

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

    function doneChangingTextCallback (text) {
      if (text === null) {
        removeToolState(element, this.name, measurementData);
      } else {
        measurementData.text = text;
      }

      measurementData.active = false;
      cornerstone.updateImage(element);
    }

    // Associate this data with this imageId so we can render it and manipulate it
    addToolState(element, this.name, measurementData);

    // Since we are dragging to another place to drop the end point, we can just activate
    // The end point and let the moveHandle move it for us.
    // TODO: LOCK TOOL
    const handleMover =
      interactionType === 'mouse' ? moveNewHandle : moveNewHandleTouch;

    cornerstone.updateImage(element);
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
          this.configuration.getTextCallback(doneChangingTextCallback);
        }

        cornerstone.updateImage(element);
      }
    );
  }

  doubleClickCallback (evt) {
    const element = evt.detail.element;
    const which = evt.detail.which;
    let data;

    if (!isMouseButtonEnabled(which, this.options.mouseButtonMask)) {
      return;
    }

    const coords = evt.detail.currentPoints.canvas;
    const toolData = getToolState(element, this.name);

    // Now check to see if there is a handle we can move
    if (!toolData) {
      return;
    }

    for (let i = 0; i < toolData.data.length; i++) {
      data = toolData.data[i];
      if (
        this.pointNearTool(element, data, coords) ||
        pointInsideBoundingBox(data.handles.textBox, coords)
      ) {
        data.active = true;
        cornerstone.updateImage(element);
        // Allow relabelling via a callback
        this.configuration.changeTextCallback(
          data,
          evt.detail,
          this._doneChangingTextCallback.bind(this, element)
        );

        evt.stopImmediatePropagation();

        return false;
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
    cornerstone.updateImage(element);
  }

  // ArrowAnnotateTouch tapCallback?
  pressCallback (evt) {
    const eventData = evt.detail;
    const element = eventData.element;
    let data;

    const coords = eventData.currentPoints.canvas;
    const toolData = getToolState(element, this.name);

    // Now check to see if there is a handle we can move
    if (!toolData) {
      return;
    }

    if (eventData.handlePressed) {
      // Allow relabelling via a callback
      this.configuration.changeTextCallback(
        eventData.handlePressed,
        eventData,
        this._doneChangingTextCallback.bind(this, element)
      );

      evt.stopImmediatePropagation();

      return false;
    }

    for (let i = 0; i < toolData.data.length; i++) {
      data = toolData.data[i];
      if (
        this.pointNearTool(element, data, coords) ||
        pointInsideBoundingBox(data.handles.textBox, coords)
      ) {
        data.active = true;
        cornerstone.updateImage(element);

        // Allow relabelling via a callback
        this.configuration.changeTextCallback(
          data,
          eventData,
          this._doneChangingTextCallback.bind(this, element)
        );

        evt.stopImmediatePropagation();

        return false;
      }
    }

    evt.preventDefault();
    evt.stopPropagation();
  }
}

function getTextCallback (doneChangingTextCallback) {
  doneChangingTextCallback(prompt('Enter your annotation:'));
}

function changeTextCallback (data, eventData, doneChangingTextCallback) {
  doneChangingTextCallback(prompt('Change your annotation:'));
}
