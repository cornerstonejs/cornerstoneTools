import external from '../externalModules.js';
import baseAnnotationTool from '../base/baseAnnotationTool.js';

import textStyle from '../stateManagement/textStyle.js';
import toolColors from '../stateManagement/toolColors.js';
import drawTextBox, { textBoxWidth } from '../util/drawTextBox.js';
import getRGBPixels from '../util/getRGBPixels.js';
import calculateSUV from '../util/calculateSUV.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';
import { getToolOptions } from '../toolOptions.js';
import { getNewContext, draw, setShadow, drawCircle } from '../util/drawing.js';


export default class extends baseAnnotationTool {
  constructor (name = 'dragProbe') {
    const strategies = {
      default: defaultStrategy,
      minimal: minimalStrategy
    };

    super({
      name,
      strategies,
      defaultStrategy: 'default',
      supportedInteractionTypes: ['mouse', 'touch'],
      configuration: {}
    });

    this.touchDragCallback = this.dragCallback.bind(this);
    this.mouseDragCallback = this.dragCallback.bind(this);

    this.dragEventData = null;
  }

  _dragCallback (evt) {
    const eventData = evt.detail;
    const { element } = eventData;

    this.dragEventData = eventData;
    this.applyActiveStrategy(evt);
    external.cornerstone.updateImage(element);
  }
}

function defaultStrategy (evt, config) {
  const cornerstone = external.cornerstone;
  const eventData = evt.detail;
  const { element, image, currentPoints } = eventData;
  const enabledElement = cornerstone.getEnabledElement(element);

  const context = getNewContext(enabledElement.canvas);

  const color = toolColors.getActiveColor();
  const fontHeight = textStyle.getFontSize();

  const x = Math.round(currentPoints.image.x);
  const y = Math.round(currentPoints.image.y);

  if (x < 0 || y < 0 || x >= image.columns || y >= image.rows) {
    return;
  }

  draw(context, (context) => {
    setShadow(context, config);

    let storedPixels;
    let text,
      str;

    if (image.color) {
      storedPixels = getRGBPixels(element, x, y, 1, 1);
      text = `${x}, ${y}`;
      str = `R: ${storedPixels[0]} G: ${storedPixels[1]} B: ${storedPixels[2]} A: ${storedPixels[3]}`;
    } else {
      storedPixels = cornerstone.getStoredPixels(element, x, y, 1, 1);
      const sp = storedPixels[0];
      const mo = sp * image.slope + image.intercept;
      const suv = calculateSUV(image, sp);

      // Draw text
      text = `${x}, ${y}`;
      str = `SP: ${sp} MO: ${parseFloat(mo.toFixed(3))}`;
      if (suv) {
        str += ` SUV: ${parseFloat(suv.toFixed(3))}`;
      }
    }

    // Draw text
    const coords = {
      // Translate the x/y away from the cursor
      x: currentPoints.image.x + 3,
      y: currentPoints.image.y - 3
    };
    const textCoords = cornerstone.pixelToCanvas(element, coords);

    drawTextBox(context, str, textCoords.x, textCoords.y + fontHeight + 5, color);
    drawTextBox(context, text, textCoords.x, textCoords.y, color);
  });
}

function minimalStrategy (evt, config) {
  const cornerstone = external.cornerstone;
  const eventData = evt.detail;
  const { element, currentPoints, isTouchEvent } = eventData;
  const enabledElement = cornerstone.getEnabledElement(element);
  const { image, canvas } = enabledElement;
  const color = toolColors.getActiveColor();

  const context = getNewContext(canvas);

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
    let translation;
    const handleRadius = 6;
    const padding = 5;
    const width = textBoxWidth(context, text, padding);

    if (isTouchEvent === true) {
      translation = {
        x: -width / 2,
        y: -textStyle.getFontSize() - 10 - 2 * handleRadius
      };
    } else {
      translation = {
        x: 12,
        y: -(textStyle.getFontSize() + 10) / 2
      };
    }

    drawCircle(context, element, textCoords, handleRadius, { color }, 'canvas');
    drawTextBox(context, text, textCoords.x + translation.x, textCoords.y + translation.y, color);
  });
}
