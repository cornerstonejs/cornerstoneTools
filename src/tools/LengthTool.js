/* eslint no-loop-func: 0 */ // --> OFF
import external from '../externalModules.js';
import BaseAnnotationTool from '../base/BaseAnnotationTool.js';
// State
import { getToolState } from '../stateManagement/toolState.js';
import toolStyle from '../stateManagement/toolStyle.js';
import toolColors from '../stateManagement/toolColors.js';
// Drawing
import { getNewContext, draw, setShadow, drawLine } from '../drawing/index.js';
import drawLinkedTextBox from '../drawing/drawLinkedTextBox.js';
import drawHandles from '../drawing/drawHandles.js';
import lineSegDistance from '../util/lineSegDistance.js';

/**
 * @export @public @class
 * @name LengthTool
 * @classdesc Tool for measuring distances.
 * @extends BaseAnnotationTool
 */
export default class LengthTool extends BaseAnnotationTool {
  constructor (name = 'Length') {
    super({
      name,
      supportedInteractionTypes: ['Mouse', 'Touch']
    });
  }

  /**
   * Create the measurement data for this tool with the end handle activated
   *
   * @param {*} eventData
   * @returns
   */
  createNewMeasurement (eventData) {
    const goodEventData =
      eventData && eventData.currentPoints && eventData.currentPoints.image;

    if (!goodEventData) {
      console.error(
        `required eventData not supplied to tool ${
          this.name
        }'s createNewMeasurement`
      );

      return;
    }

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
        end: {
          x: eventData.currentPoints.image.x,
          y: eventData.currentPoints.image.y,
          highlight: true,
          active: true
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
    const hasStartAndEndHandles =
      data && data.handles && data.handles.start && data.handles.end;
    const validParameters = hasStartAndEndHandles;

    if (!validParameters) {
      console.warn(
        `invalid parameters supplieed to tool ${this.name}'s pointNearTool`
      );
    }

    if (!validParameters || data.visible === false) {
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
    const eventData = evt.detail;
    const toolData = getToolState(evt.currentTarget, this.name);

    if (!toolData) {
      return;
    }

    // We have tool data for this element - iterate over each one and draw it
    const context = getNewContext(eventData.canvasContext.canvas);
    const { image, element } = eventData;

    const lineWidth = toolStyle.getToolWidth();
    const config = this.configuration;
    const imagePlane = external.cornerstone.metaData.get(
      'imagePlaneModule',
      image.imageId
    );
    let rowPixelSpacing;
    let colPixelSpacing;

    if (imagePlane) {
      rowPixelSpacing =
        imagePlane.rowPixelSpacing || imagePlane.rowImagePixelSpacing;
      colPixelSpacing =
        imagePlane.columnPixelSpacing || imagePlane.colImagePixelSpacing;
    } else {
      rowPixelSpacing = image.rowPixelSpacing;
      colPixelSpacing = image.columnPixelSpacing;
    }

    for (let i = 0; i < toolData.data.length; i++) {
      const data = toolData.data[i];

      if (data.visible === false) {
        continue;
      }

      draw(context, (context) => {
        // Configurable shadow
        setShadow(context, config);

        const color = toolColors.getColorIfActive(data);

        // Draw the measurement line
        drawLine(context, element, data.handles.start, data.handles.end, {
          color
        });

        // Draw the handles
        const handleOptions = {
          drawHandlesIfActive: config && config.drawHandlesOnHover
        };

        drawHandles(context, eventData, data.handles, color, handleOptions);

        // Set rowPixelSpacing and columnPixelSpacing to 1 if they are undefined (or zero)
        const dx =
          (data.handles.end.x - data.handles.start.x) * (colPixelSpacing || 1);
        const dy =
          (data.handles.end.y - data.handles.start.y) * (rowPixelSpacing || 1);

        // Calculate the length, and create the text variable with the millimeters or pixels suffix
        const length = Math.sqrt(dx * dx + dy * dy);

        // Store the length inside the tool for outside access
        data.length = length;

        if (!data.handles.textBox.hasMoved) {
          const coords = {
            x: Math.max(data.handles.start.x, data.handles.end.x)
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

        const text = textBoxText(data, rowPixelSpacing, colPixelSpacing);

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

    function textBoxText (data, rowPixelSpacing, colPixelSpacing) {
      // Set the length text suffix depending on whether or not pixelSpacing is available
      let suffix = ' mm';

      if (!rowPixelSpacing || !colPixelSpacing) {
        suffix = ' pixels';
      }

      return `${data.length.toFixed(2)}${suffix}`;
    }

    function textBoxAnchorPoints (handles) {
      const midpoint = {
        x: (handles.start.x + handles.end.x) / 2,
        y: (handles.start.y + handles.end.y) / 2
      };

      return [handles.start, midpoint, handles.end];
    }
  }
}
