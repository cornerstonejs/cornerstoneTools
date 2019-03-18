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

/**
 * @public
 * @class TextMarkerTool
 * @memberof Tools.Annotation
 *
 * @classdesc Tool for annotating an image with text markers.
 * @extends Tools.Base.BaseAnnotationTool
 */
export default class TextMarkerTool extends BaseAnnotationTool {
  constructor(configuration = {}) {
    const defaultConfig = {
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
    const initialConfiguration = Object.assign(defaultConfig, configuration);

    super(initialConfiguration);

    this.initialConfiguration = initialConfiguration;
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

const textMarkerCursor = `<svg
     data-icon="textMarker" role="img" xmlns="http://www.w3.org/2000/svg"
     width="16" height="16" viewBox="0 0 1792 1792"
   >
   <path fill="#ffffff" d="M789 559l-170 450q33 0 136.5 2t160.5 2q19 0
    57-2-87-253-184-452zm-725 1105l2-79q23-7 56-12.5t57-10.5 49.5-14.5 44.5-29
    31-50.5l237-616 280-724h128q8 14 11 21l205 480q33 78 106 257.5t114 274.5q15
    34 58 144.5t72 168.5q20 45 35 57 19 15 88 29.5t84 20.5q6 38 6 57 0 5-.5
    13.5t-.5 12.5q-63 0-190-8t-191-8q-76 0-215 7t-178 8q0-43 4-78l131-28q1 0
    12.5-2.5t15.5-3.5 14.5-4.5 15-6.5 11-8 9-11
    2.5-14q0-16-31-96.5t-72-177.5-42-100l-450-2q-26 58-76.5 195.5t-50.5 162.5q0
    22 14 37.5t43.5 24.5 48.5 13.5 57 8.5 41 4q1 19 1 58 0 9-2 27-58
    0-174.5-10t-174.5-10q-8 0-26.5 4t-21.5 4q-80 14-188 14z"
  />
 </svg>
 `;
