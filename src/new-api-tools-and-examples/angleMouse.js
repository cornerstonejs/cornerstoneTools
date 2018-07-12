/* eslint no-loop-func: 0 */ // --> OFF
import external from './../externalModules.js';
import baseMouseAnnotationTool from './../base/baseMouseAnnotationTool.js';
// State
import textStyle from './../stateManagement/textStyle.js';
import { addToolState, getToolState } from './../stateManagement/toolState.js';
import toolStyle from '../stateManagement/toolStyle.js';
import toolColors from '../stateManagement/toolColors.js';
// Manipulators
import drawHandles from './../manipulators/drawHandles.js';
import moveNewHandle from '../manipulators/moveNewHandle.js';
// Drawing
import {
  getNewContext,
  draw,
  setShadow,
  drawJoinedLines
} from './../util/drawing.js';
import drawLinkedTextBox from './../util/drawLinkedTextBox.js';
import lineSegDistance from './../util/lineSegDistance.js';
import roundToDecimal from './../util/roundToDecimal.js';

const cornerstone = external.cornerstone;

export default class extends baseMouseAnnotationTool {
  constructor () {
    super('simpleAngle');
    console.log(`my name is ${this.name}`);
  }

  /**
   * Create the measurement data for this tool with the end handle activated
   *
   * @param {*} eventData
   * @returns
   */
  createNewMeasurement (eventData) {
    // Create the measurement data for this tool with the end handle activated
    return {
      visible: true,
      active: true,
      color: undefined,
      handles: {
        start: {
          x: eventData.currentPoints.image.x,
          y: eventData.currentPoints.image.y,
          highlight: true,
          active: false
        },
        middle: {
          x: eventData.currentPoints.image.x,
          y: eventData.currentPoints.image.y,
          highlight: true,
          active: true
        },
        end: {
          x: eventData.currentPoints.image.x,
          y: eventData.currentPoints.image.y,
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

  /**
   *
   *
   * @param {*} evt
   * @returns
   */
  renderToolData (evt) {
    const eventData = evt.detail;
    const enabledElement = eventData.enabledElement;
    // If we have no toolData for this element, return immediately as there is nothing to do
    const toolData = getToolState(evt.currentTarget, this.name);

    if (!toolData) {
      return;
    }

    // We have tool data for this element - iterate over each one and draw it
    const context = getNewContext(eventData.canvasContext.canvas);

    const lineWidth = toolStyle.getToolWidth();
    const font = textStyle.getFont();
    const config = this.getConfiguration();

    for (let i = 0; i < toolData.data.length; i++) {
      const data = toolData.data[i];

      if (data.visible === false) {
        continue;
      }

      draw(context, (context) => {
        setShadow(context, config);

        // Differentiate the color of activation tool
        const color = toolColors.getColorIfActive(data);

        const handleStartCanvas = cornerstone.pixelToCanvas(
          eventData.element,
          data.handles.start
        );
        const handleMiddleCanvas = cornerstone.pixelToCanvas(
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
          drawHandlesIfActive: config && config.drawHandlesOnHover
        };

        drawHandles(context, eventData, data.handles, color, handleOptions);

        // Draw the text
        context.fillStyle = color;

        // Default to isotropic pixel size, update suffix to reflect this
        const columnPixelSpacing = eventData.image.columnPixelSpacing || 1;
        const rowPixelSpacing = eventData.image.rowPixelSpacing || 1;

        const sideA = {
          x:
            (Math.ceil(data.handles.middle.x) -
              Math.ceil(data.handles.start.x)) *
            columnPixelSpacing,
          y:
            (Math.ceil(data.handles.middle.y) -
              Math.ceil(data.handles.start.y)) *
            rowPixelSpacing
        };

        const sideB = {
          x:
            (Math.ceil(data.handles.end.x) - Math.ceil(data.handles.middle.x)) *
            columnPixelSpacing,
          y:
            (Math.ceil(data.handles.end.y) - Math.ceil(data.handles.middle.y)) *
            rowPixelSpacing
        };

        const sideC = {
          x:
            (Math.ceil(data.handles.end.x) - Math.ceil(data.handles.start.x)) *
            columnPixelSpacing,
          y:
            (Math.ceil(data.handles.end.y) - Math.ceil(data.handles.start.y)) *
            rowPixelSpacing
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

        if (data.rAngle) {
          const text = textBoxText(
            data,
            eventData.image.rowPixelSpacing,
            eventData.image.columnPixelSpacing
          );

          const distance = 15;

          let textCoords;

          if (!data.handles.textBox.hasMoved) {
            textCoords = {
              x: handleMiddleCanvas.x,
              y: handleMiddleCanvas.y
            };

            context.font = font;
            const textWidth = context.measureText(text).width;

            if (handleMiddleCanvas.x < handleStartCanvas.x) {
              textCoords.x -= distance + textWidth + 10;
            } else {
              textCoords.x += distance;
            }

            const transform = cornerstone.internal.getTransform(enabledElement);

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

    function textBoxText (data, rowPixelSpacing, columnPixelSpacing) {
      const suffix =
        !rowPixelSpacing || !columnPixelSpacing ? ' (isotropic)' : '';
      const str = '00B0'; // Degrees symbol

      return (
        data.rAngle.toString() + String.fromCharCode(parseInt(str, 16)) + suffix
      );
    }

    function textBoxAnchorPoints (handles) {
      return [handles.start, handles.middle, handles.end];
    }
  }

  addNewMeasurement (eventData) {
    const measurementData = this.createNewMeasurement(eventData);
    const element = eventData.element;

    // Associate this data with this imageId so we can render it and manipulate it
    addToolState(element, this.name, measurementData);

    // Since we are dragging to another place to drop the end point, we can just activate
    // The end point and let the moveHandle move it for us.
    // Disable:
    // - move, drag, down, down_activate
    cornerstone.updateImage(element);

    moveNewHandle(
      eventData,
      this.name,
      measurementData,
      measurementData.handles.middle,
      () => {
        measurementData.active = false;
        // End if any handle is outside image, re-add listeners
        // If (anyHandlesOutsideImage(eventData, measurementData.handles)) {
        //   // Delete the measurement
        //   RemoveToolState(element, toolType, measurementData);

        //   Element.addEventListener(
        //     EVENTS.MOUSE_MOVE,
        //     SimpleAngle.mouseMoveCallback
        //   );
        //   Element.addEventListener(
        //     EVENTS.MOUSE_DRAG,
        //     SimpleAngle.mouseMoveCallback
        //   );
        //   Element.addEventListener(
        //     EVENTS.MOUSE_DOWN,
        //     SimpleAngle.mouseDownCallback
        //   );
        //   Element.addEventListener(
        //     EVENTS.MOUSE_DOWN_ACTIVATE,
        //     SimpleAngle.mouseDownActivateCallback
        //   );
        //   Cornerstone.updateImage(element);

        //   Return;
        // }

        measurementData.handles.end.active = true;
        cornerstone.updateImage(element);

        moveNewHandle(
          eventData,
          this.name,
          measurementData,
          measurementData.handles.end,
          function () {
            measurementData.active = false;
            // If (
            //   AnyHandlesOutsideImage(mouseEventData, measurementData.handles)
            // ) {
            //   // Delete the measurement
            //   RemoveToolState(element, toolType, measurementData);
            // }

            // TODO: Re-add event listeners
            cornerstone.updateImage(element);
          }
        );
      }
    );
  }
}

function length (vector) {
  return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
}
