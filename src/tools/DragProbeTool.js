/* eslint no-underscore-dangle: 0 */
import external from '../externalModules.js';
import baseTool from '../base/BaseTool.js';

import textStyle from '../stateManagement/textStyle.js';
import toolColors from '../stateManagement/toolColors.js';
import drawTextBox from '../util/drawTextBox.js';
import getRGBPixels from '../util/getRGBPixels.js';
import calculateSUV from '../util/calculateSUV.js';
import { getNewContext, draw, setShadow, drawCircle } from '../util/drawing.js';


export default class extends baseTool {
  constructor (name = 'DragProbe') {
    const strategies = {
      default: defaultStrategy,
      minimal: minimalStrategy
    };

    super({
      name,
      strategies,
      defaultStrategy: 'default',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: {}
    });

    this.touchDragCallback = this._movingEventCallback.bind(this);
    this.touchEndCallback = this._endMovingEventCallback.bind(this);

    this.mouseDragCallback = this._movingEventCallback.bind(this);
    this.mouseUpCallback = this._endMovingEventCallback.bind(this);

    this.dragEventData = {};
  }

  _movingEventCallback (evt) {
    const eventData = evt.detail;
    const { element } = eventData;

    this.dragEventData = eventData;
    external.cornerstone.updateImage(element);
  }

  _endMovingEventCallback (evt) {
    const eventData = evt.detail;
    const { element } = eventData;

    this.dragEventData = {};
    external.cornerstone.updateImage(element);
  }

  renderToolData (evt) {
    if (evt && evt.detail && Boolean(Object.keys(this.dragEventData.currentPoints).length)) {
      evt.detail.currentPoints = this.dragEventData.currentPoints;
      this.applyActiveStrategy(evt);
    }
  }
}

/**
 * Default strategy will pick the exactly point of mouse/touch interact and display the probe data.
 *
 * @param  {} evt Image rendered event
 * @param  {} config Tool configuration
 */
const defaultStrategy = (evt, config) => {
  const cornerstone = external.cornerstone;
  const eventData = evt.detail;
  const { element, image, currentPoints, canvasContext } = eventData;

  const context = getNewContext(canvasContext.canvas);

  const color = toolColors.getActiveColor();
  const fontHeight = textStyle.getFontSize();

  const x = Math.round(currentPoints.image.x);
  const y = Math.round(currentPoints.image.y);

  if (x < 0 || y < 0 || x >= image.columns || y >= image.rows) {
    return;
  }

  draw(context, (context) => {
    setShadow(context, config);

    const text = `${x}, ${y}`;
    let storedPixels;
    let str;

    if (image.color) {
      storedPixels = getRGBPixels(element, x, y, 1, 1);
      str = `R: ${storedPixels[0]} G: ${storedPixels[1]} B: ${storedPixels[2]} A: ${storedPixels[3]}`;
    } else {
      storedPixels = cornerstone.getStoredPixels(element, x, y, 1, 1);
      const sp = storedPixels[0];
      const mo = sp * image.slope + image.intercept;
      const suv = calculateSUV(image, sp);

      // Draw text
      str = `SP: ${sp} MO: ${parseFloat(mo.toFixed(3))}`;
      if (suv) {
        str += ` SUV: ${parseFloat(suv.toFixed(3))}`;
      }
    }

    // Draw text 5px away from cursor
    const textCoords = {
      x: currentPoints.canvas.x + 5,
      y: currentPoints.canvas.y - 5
    };

    drawTextBox(context, str, textCoords.x, textCoords.y + fontHeight + 5, color);
    drawTextBox(context, text, textCoords.x, textCoords.y, color);
  });
};

/**
 * Minimal strategy will position a circle and use the center of the circle to calculate and display probe data.
 *
 * @param  {} evt Image rendered event
 * @param  {} config Tool configuration
 */
const minimalStrategy = (evt, config) => {
  const cornerstone = external.cornerstone;
  const eventData = evt.detail;
  const { element, image, currentPoints, canvasContext, isTouchEvent } = eventData;

  const context = getNewContext(canvasContext.canvas);
  const color = toolColors.getActiveColor();

  let pageCoordY = currentPoints.page.y - textStyle.getFontSize() / 2;

  if (isTouchEvent) {
    pageCoordY = currentPoints.page.y - textStyle.getFontSize() * 4;
  }
  const toolCoords = cornerstone.pageToPixel(element, currentPoints.page.x, pageCoordY);

  if (toolCoords.x < 0 || toolCoords.y < 0 ||
    toolCoords.x >= image.columns || toolCoords.y >= image.rows) {
    return;
  }

  draw(context, (context) => {
    setShadow(context, config);

    const seriesModule = cornerstone.metaData.get('generalSeriesModule', image.imageId);
    const modality = seriesModule && seriesModule.modality;

    let storedPixels;
    let text = '';

    if (image.color) {
      storedPixels = getRGBPixels(element, toolCoords.x, toolCoords.y, 1, 1);
      text = `R: ${storedPixels[0]} G: ${storedPixels[1]} B: ${storedPixels[2]}`;
    } else {
      storedPixels = cornerstone.getStoredPixels(element, toolCoords.x, toolCoords.y, 1, 1);
      const sp = storedPixels[0];
      const mo = sp * image.slope + image.intercept;

      const modalityPixelValueText = parseFloat(mo.toFixed(2));

      if (modality === 'CT') {
        text += `HU: ${modalityPixelValueText}`;
      } else if (modality === 'PT') {
        text += modalityPixelValueText;
        const suv = calculateSUV(image, sp);

        if (suv) {
          text += ` SUV: ${parseFloat(suv.toFixed(2))}`;
        }
      } else {
        text += modalityPixelValueText;
      }
    }

    // Prepare text
    const textCoords = cornerstone.pixelToCanvas(element, toolCoords);

    // Translate the x/y away from the cursor
    let translation = {
      x: 12,
      y: -(textStyle.getFontSize() + 10) / 2
    };

    const handleRadius = 6;
    const padding = 5;
    const width = context.measureText(text).width + 2 * padding;

    if (isTouchEvent) {
      translation = {
        x: -width / 2,
        y: -textStyle.getFontSize() - 10 - 2 * handleRadius
      };
    }

    drawCircle(context, element, textCoords, handleRadius, { color }, 'canvas');
    drawTextBox(context, text, textCoords.x + translation.x, textCoords.y + translation.y, color);
  });
};
