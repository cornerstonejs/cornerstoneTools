import external from './../../externalModules.js';
import BaseAnnotationTool from '../base/BaseAnnotationTool.js';
// State
import { getToolState } from './../../stateManagement/toolState.js';
import textStyle from './../../stateManagement/textStyle.js';
import toolColors from './../../stateManagement/toolColors.js';
// Drawing
import { getNewContext, draw } from './../../drawing/index.js';
import drawTextBox from './../../drawing/drawTextBox.js';
import drawHandles from './../../drawing/drawHandles.js';
// Utilities
import getRGBPixels from './../../util/getRGBPixels.js';
import calculateSUV from './../../util/calculateSUV.js';

/**
 * @public
 * @class ProbeTool
 * @memberof Tools.Annotation
 * @classdesc Tool which provides a probe of the image data at the
 * desired position.
 * @extends Tools.Base.BaseAnnotationTool
 */
export default class ProbeTool extends BaseAnnotationTool {
  constructor(configuration = {}) {
    const defaultConfig = {
      name: 'Probe',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      svgCursor: probeCursor,
    };
    const initialConfiguration = Object.assign(defaultConfig, configuration);

    super(initialConfiguration);

    this.initialConfiguration = initialConfiguration;
  }

  createNewMeasurement(eventData) {
    const goodEventData =
      eventData && eventData.currentPoints && eventData.currentPoints.image;

    if (!goodEventData) {
      console.error(
        `required eventData not supplieed to tool ${
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
        end: {
          x: eventData.currentPoints.image.x,
          y: eventData.currentPoints.image.y,
          highlight: true,
          active: true,
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
    const hasEndHandle = data && data.handles && data.handles.end;
    const validParameters = hasEndHandle;

    if (!validParameters) {
      console.warn(
        `invalid parameters supplieed to tool ${this.name}'s pointNearTool`
      );
    }

    if (!validParameters || data.visible === false) {
      return false;
    }

    const probeCoords = external.cornerstone.pixelToCanvas(
      element,
      data.handles.end
    );

    return external.cornerstoneMath.point.distance(probeCoords, coords) < 5;
  }

  renderToolData(evt) {
    const eventData = evt.detail;
    const { handleRadius } = this.configuration;
    const toolData = getToolState(evt.currentTarget, this.name);

    if (!toolData) {
      return;
    }

    // We have tool data for this element - iterate over each one and draw it
    const context = getNewContext(eventData.canvasContext.canvas);
    const { image } = eventData;
    const fontHeight = textStyle.getFontSize();

    for (let i = 0; i < toolData.data.length; i++) {
      const data = toolData.data[i];

      if (data.visible === false) {
        continue;
      }

      draw(context, context => {
        const color = toolColors.getColorIfActive(data);

        // Draw the handles
        drawHandles(context, eventData, data.handles, {
          handleRadius,
          color,
        });

        const x = Math.round(data.handles.end.x);
        const y = Math.round(data.handles.end.y);
        let storedPixels;

        let text, str;

        if (x >= 0 && y >= 0 && x < image.columns && y < image.rows) {
          text = `${x}, ${y}`;

          if (image.color) {
            storedPixels = getRGBPixels(eventData.element, x, y, 1, 1);
            str = `R: ${storedPixels[0]} G: ${storedPixels[1]} B: ${
              storedPixels[2]
            }`;
          } else {
            storedPixels = external.cornerstone.getStoredPixels(
              eventData.element,
              x,
              y,
              1,
              1
            );
            const sp = storedPixels[0];
            const mo = sp * image.slope + image.intercept;
            const suv = calculateSUV(image, sp);

            // Draw text
            str = `SP: ${sp} MO: ${parseFloat(mo.toFixed(3))}`;
            if (suv) {
              str += ` SUV: ${parseFloat(suv.toFixed(3))}`;
            }
          }

          // Coords for text
          const coords = {
            // Translate the x/y away from the cursor
            x: data.handles.end.x + 3,
            y: data.handles.end.y - 3,
          };
          const textCoords = external.cornerstone.pixelToCanvas(
            eventData.element,
            coords
          );

          drawTextBox(
            context,
            str,
            textCoords.x,
            textCoords.y + fontHeight + 5,
            color
          );
          drawTextBox(context, text, textCoords.x, textCoords.y, color);
        }
      });
    }
  }
}

const probeCursor = {
  svgGroupString: `<path fill="ACTIVE_COLOR" d="M1152 896q0 106-75 181t-181 75-181-75-75-181 75-181 181-75 181 75
    75 181zm-256-544q-148 0-273 73t-198 198-73 273 73 273 198 198 273 73 273-73
    198-198 73-273-73-273-198-198-273-73zm768 544q0 209-103 385.5t-279.5
    279.5-385.5 103-385.5-103-279.5-279.5-103-385.5 103-385.5 279.5-279.5
    385.5-103 385.5 103 279.5 279.5 103 385.5z"
  />`,
  options: {
    viewBox: {
      x: 1792,
      y: 1792,
    },
  },
};
