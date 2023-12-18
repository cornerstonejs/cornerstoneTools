import BaseAnnotationTool from '../base/BaseAnnotationTool.js';
import external from './../../externalModules.js';
import pointInsideBoundingBox from './../../util/pointInsideBoundingBox.js';
import toolColors from './../../stateManagement/toolColors.js';
import { getNewContext, draw, setShadow } from './../../drawing/index.js';
import drawTextBox from './../../drawing/drawTextBox.js';
import {
  removeToolState,
  getToolState,
} from './../../stateManagement/toolState.js';
import { textMarkerCursor } from '../cursors/index.js';

/**
 * @public
 * @class TextMarkerTool
 * @memberof Tools.Annotation
 *
 * @classdesc Tool for annotating an image with text markers.
 * @extends Tools.Base.BaseAnnotationTool
 */
export default class TextMarkerTool extends BaseAnnotationTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'TextMarker',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: {
        markers: [],
        current: '',
        ascending: true,
        loop: false,
        changeTextCallback,
      },
      svgCursor: textMarkerCursor,
    };

    super(props, defaultProps);
    this.touchPressCallback = this._changeText.bind(this);
    this.doubleClickCallback = this._changeText.bind(this);
  }

  createNewMeasurement(eventData) {
    const config = this.configuration;

    if (!config.current) {
      return;
    }

    // Create the measurement data for this tool with the end handle activated
    const measurementData = {
      visible: true,
      active: true,
      text: config.current,
      color: undefined,
      handles: {
        end: {
          x: eventData.currentPoints.image.x,
          y: eventData.currentPoints.image.y,
          highlight: true,
          active: true,
          hasBoundingBox: true,
        },
      },
    };

    // Create a rectangle representing the image
    const imageRect = {
      left: 0,
      top: 0,
      width: eventData.image.width,
      height: eventData.image.height,
    };

    // Check if the current handle is outside the image,
    // If it is, prevent the handle creation
    if (
      !external.cornerstoneMath.point.insideRect(
        measurementData.handles.end,
        imageRect
      )
    ) {
      return;
    }

    // Update the current marker for the next marker
    let currentIndex = config.markers.indexOf(config.current);

    const increment = config.ascending ? 1 : -1;

    currentIndex += increment;

    if (currentIndex >= config.markers.length) {
      currentIndex = config.loop ? 0 : -1;
    } else if (currentIndex < 0) {
      currentIndex = config.loop ? config.markers.length : -1;
    }

    config.current = config.markers[currentIndex];

    return measurementData;
  }

  pointNearTool(element, data, coords) {
    if (data.visible === false) {
      return false;
    }

    if (!data.handles.end.boundingBox) {
      return;
    }

    const distanceToPoint = external.cornerstoneMath.rect.distanceToPoint(
      data.handles.end.boundingBox,
      coords
    );
    const insideBoundingBox = pointInsideBoundingBox(data.handles.end, coords);

    return distanceToPoint < 10 || insideBoundingBox;
  }

  updateCachedStats() {
    // Implementing to satisfy BaseAnnotationTool
  }

  renderToolData(evt) {
    const eventData = evt.detail;
    const config = this.configuration;

    // If we have no toolData for this element, return immediately as there is nothing to do
    const toolData = getToolState(eventData.element, this.name);

    if (!toolData) {
      return;
    }

    // We have tool data for this element - iterate over each one and draw it
    const context = getNewContext(eventData.canvasContext.canvas);

    for (let i = 0; i < toolData.data.length; i++) {
      const data = toolData.data[i];

      if (data.visible === false) {
        continue;
      }

      const color = toolColors.getColorIfActive(data);

      draw(context, context => {
        setShadow(context, config);

        const textCoords = external.cornerstone.pixelToCanvas(
          eventData.element,
          data.handles.end
        );

        const options = {
          centering: {
            x: true,
            y: true,
          },
        };

        data.handles.end.boundingBox = drawTextBox(
          context,
          data.text,
          textCoords.x,
          textCoords.y - 10,
          color,
          options
        );
      });
    }
  }

  _changeText(evt) {
    const eventData = evt.detail;
    const { element, currentPoints } = eventData;
    let data;

    function doneChangingTextCallback(data, updatedText, deleteTool) {
      if (deleteTool === true) {
        removeToolState(element, this.name, data);
      } else {
        data.text = updatedText;
      }

      data.active = false;
      external.cornerstone.updateImage(element);
    }

    const config = this.configuration;
    const coords = currentPoints.canvas;
    const toolData = getToolState(element, this.name);

    // Now check to see if there is a handle we can move
    if (!toolData) {
      return;
    }

    for (let i = 0; i < toolData.data.length; i++) {
      data = toolData.data[i];
      if (this.pointNearTool(element, data, coords)) {
        data.active = true;
        external.cornerstone.updateImage(element);

        // Allow relabelling via a callback
        config.changeTextCallback(data, eventData, doneChangingTextCallback);

        evt.stopImmediatePropagation();
        evt.preventDefault();
        evt.stopPropagation();

        return;
      }
    }
  }

  /**
   * Static method which returns the text which is drawn on the canvas in the end.
   **/
  static getToolTextFromToolState(
    context,
    isColorImage,
    toolState,
    modality,
    hasPixelSpacing,
    displayUncertainties,
    options = {}
  ) {
    return toolState.text;
  }
}

/**
 * This function is a callback to be overwriten in order to provide the wanted feature
 * modal, overlay, popup or any kind of interaction with the user to be able to update
 * the text marker label.
 *
 * @param  {Object} data
 * @param  {Object} eventData
 * @param  {doneChangingTextCallback} doneChangingTextCallback
 * @returns {void}
 */
const changeTextCallback = (data, eventData, doneChangingTextCallback) => {
  // eslint-disable-next-line no-alert
  doneChangingTextCallback(data, prompt('Change your annotation:'));
};

/**
 * @callback doneChangingTextCallback
 * @param {Object} data
 * @param {string} text - The new text
 */
