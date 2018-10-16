import external from '../externalModules.js';
import BaseAnnotationTool from '../base/BaseAnnotationTool.js';
// State
import textStyle from '../stateManagement/textStyle.js';
import {
  addToolState,
  getToolState,
  removeToolState
} from '../stateManagement/toolState.js';
import toolStyle from '../stateManagement/toolStyle.js';
import toolColors from '../stateManagement/toolColors.js';
// Manipulators
import moveNewHandle from '../manipulators/moveNewHandle.js';
import moveNewHandleTouch from '../manipulators/moveNewHandleTouch.js';
import anyHandlesOutsideImage from '../manipulators/anyHandlesOutsideImage.js';
// Drawing
import { getNewContext, draw, setShadow, drawLine } from '../drawing/index.js';
import drawHandles from '../drawing/drawHandles.js';
import drawLinkedTextBox from '../drawing/drawLinkedTextBox.js';
import lineSegDistance from '../util/lineSegDistance.js';
import roundToDecimal from '../util/roundToDecimal.js';
import EVENTS from './../events.js';

/**
 * @export @public @class
 * @name CobbAngleTool
 * @classdesc Tool for measuring the angle between two straight lines.
 * @extends BaseAnnotationTool
 */
export default class CobbAngleTool extends BaseAnnotationTool {
  constructor (name = 'CobbAngle') {
    super({
      name,
      supportedInteractionTypes: ['Mouse', 'Touch']
    });
    this.hasIncomplete = false;
  }

  /**
   * Create the measurement data for this tool with the end handle activated
   *
   * @param {*} eventData
   * @returns
   */
  createNewMeasurement (eventData) {
    // Create the measurement data for this tool with the end handle activated
    this.hasIncomplete = true;

    return {
      visible: true,
      active: true,
      color: undefined,
      complete: false,
      value: '',
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
        start2: {
          x: eventData.currentPoints.image.x,
          y: eventData.currentPoints.image.y,
          highlight: true,
          active: false,
          drawnIndependently: true
        },
        end2: {
          x: eventData.currentPoints.image.x + 1,
          y: eventData.currentPoints.image.y,
          highlight: true,
          active: false,
          drawnIndependently: true
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

    if (this.hasIncomplete) {
      return false;
    }

    return (
      lineSegDistance(element, data.handles.start, data.handles.end, coords) <
        25 ||
      lineSegDistance(element, data.handles.start2, data.handles.end2, coords) <
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
    // If we have no toolData for this element, return immediately as there is nothing to do
    const toolData = getToolState(evt.currentTarget, this.name);

    if (!toolData) {
      return;
    }

    // We have tool data for this element - iterate over each one and draw it
    const context = getNewContext(eventData.canvasContext.canvas);

    const lineWidth = toolStyle.getToolWidth();
    const font = textStyle.getFont();
    const config = this.configuration;

    for (let i = 0; i < toolData.data.length; i++) {
      const data = toolData.data[i];

      if (data.visible === false) {
        continue;
      }

      draw(context, (context) => {
        setShadow(context, config);

        // Differentiate the color of activation tool
        const color = toolColors.getColorIfActive(data);

        drawLine(context, eventData.element, data.handles.start, data.handles.end, {
          color
        });


        if (data.complete) {
          drawLine(context, eventData.element, data.handles.start2, data.handles.end2, {
            color
          });
        }

        // Draw the handles
        const handleOptions = {
          drawHandlesIfActive: config && config.drawHandlesOnHover
        };

        drawHandles(context, eventData, data.handles, color, handleOptions);

        // Draw the text
        context.fillStyle = color;

        const text = data.value;

        if (!data.handles.textBox.hasMoved) {
          const textCoords = {
            x: (data.handles.start.x + data.handles.end.x) / 2,
            y: (data.handles.start.y + data.handles.end.y) / 2 - 10
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


    function textBoxAnchorPoints (handles) {
      return [handles.start, handles.start2, handles.end, handles.end2];
    }
  }

  getIncomplete (target) {
    const toolData = getToolState(target, this.name);

    if (toolData === undefined) {
      return;
    }

    for (let i = 0; i < toolData.data.length; i++) {
      if (toolData.data[i].complete === false) {
        return toolData.data[i];
      }
    }
  }

  addNewMeasurement (evt, interactionType) {

    evt.preventDefault();
    evt.stopPropagation();

    const eventData = evt.detail;

    let measurementData;
    let toMoveHandle;

    // Search for incomplete measurements
    const element = evt.detail.element;
    const maybePending = this.getIncomplete(element);

    if (maybePending) {
      measurementData = maybePending;
      measurementData.complete = true;
      measurementData.handles.start2 = {
        x: eventData.currentPoints.image.x,
        y: eventData.currentPoints.image.y,
        drawnIndependently: false,
        highlight: true,
        active: false
      };
      measurementData.handles.end2 = {
        x: eventData.currentPoints.image.x,
        y: eventData.currentPoints.image.y,
        drawnIndependently: false,
        highlight: true,
        active: true
      };
      toMoveHandle = measurementData.handles.end2;
      this.hasIncomplete = false;
    } else {
      measurementData = this.createNewMeasurement(eventData);
      addToolState(element, this.name, measurementData);
      toMoveHandle = measurementData.handles.end;
    }

    // MoveHandle, moveNewHandle, moveHandleTouch, and moveNewHandleTouch
    // All take the same parameters, but register events differentlIy.
    const handleMover =
      interactionType === 'Mouse' ? moveNewHandle : moveNewHandleTouch;

    // Associate this data with this imageId so we can render it and manipulate it
    external.cornerstone.updateImage(element);

    handleMover(
      eventData,
      this.name,
      measurementData,
      toMoveHandle,
      () => {
        measurementData.active = false;
        measurementData.handles.end.active = true;

        // TODO: `anyHandlesOutsideImage` deletion should be a config setting
        // TODO: Maybe globally? Mayber per tool?
        // If any handle is outside image, delete and abort
        if (anyHandlesOutsideImage(eventData, measurementData.handles)) {
          // Delete the measurement
          removeToolState(element, this.name, measurementData);
        }
        external.cornerstone.updateImage(element);
      }
    );
  }

  onMeasureModified (ev) {
    const image = external.cornerstone.getEnabledElement(ev.detail.element).image;

    if (ev.detail.toolType !== this.name) {
      return;
    }
    const data = ev.detail.measurementData;

    data.value = calculateValue(data, image);

    function calculateValue (data, image) {
      // Default to isotropic pixel size, update suffix to reflect this
      const columnPixelSpacing = image.columnPixelSpacing || 1;
      const rowPixelSpacing = image.rowPixelSpacing || 1;

      const dx1 = (Math.ceil(data.handles.start.x) - Math.ceil(data.handles.end.x)) * columnPixelSpacing;
      const dy1 = (Math.ceil(data.handles.start.y) - Math.ceil(data.handles.end.y)) * rowPixelSpacing;
      const dx2 = (Math.ceil(data.handles.start2.x) - Math.ceil(data.handles.end2.x)) * columnPixelSpacing;
      const dy2 = (Math.ceil(data.handles.start2.y) - Math.ceil(data.handles.end2.y)) * rowPixelSpacing;

      let angle = Math.acos(Math.abs(((dx1 * dx2) + (dy1 * dy2)) / (Math.sqrt((dx1 * dx1) + (dy1 * dy1)) * Math.sqrt((dx2 * dx2) + (dy2 * dy2)))));

      angle *= (180 / Math.PI);

      const rAngle = roundToDecimal(angle, 2);

      if (!Number.isNaN(data.rAngle)) {
        return textBoxText(
          rAngle,
          image.rowPixelSpacing,
          image.columnPixelSpacing
        );
      }

      return '';
    }

    function textBoxText (rAngle, rowPixelSpacing, columnPixelSpacing) {
      const suffix =
        !rowPixelSpacing || !columnPixelSpacing ? ' (isotropic)' : '';
      const str = '00B0'; // Degrees symbol


      return (
        rAngle.toString() + String.fromCharCode(parseInt(str, 16)) + suffix
      );
    }


  }

  activeCallback (element) {
    this.onMeasureModified = this.onMeasureModified.bind(this);
    element.addEventListener(EVENTS.MEASUREMENT_MODIFIED, this.onMeasureModified);
  }

  passiveCallback (element) {
    this.onMeasureModified = this.onMeasureModified.bind(this);
    element.addEventListener(EVENTS.MEASUREMENT_MODIFIED, this.onMeasureModified);
  }

  enabledCallback (element) {
    element.removeEventListener(EVENTS.MEASUREMENT_MODIFIED, this.onMeasureModified);

  }

  disabledCallback (element) {
    element.removeEventListener(EVENTS.MEASUREMENT_MODIFIED, this.onMeasureModified);
  }
}
