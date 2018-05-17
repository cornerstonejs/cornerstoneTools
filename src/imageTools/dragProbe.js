import EVENTS from '../events.js';
import external from '../externalModules.js';
import simpleMouseButtonTool from './simpleMouseButtonTool.js';
import touchDragTool from './touchDragTool.js';
import textStyle from '../stateManagement/textStyle.js';
import toolColors from '../stateManagement/toolColors.js';
import drawTextBox, { textBoxWidth, textBoxHeight } from '../util/drawTextBox.js';
import getRGBPixels from '../util/getRGBPixels.js';
import calculateSUV from '../util/calculateSUV.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';
import { getToolOptions } from '../toolOptions.js';
import { getNewContext, draw, drawCircle, setShadow } from '../util/drawing.js';

const toolType = 'dragProbe';

let dragEventData;

function defaultStrategy (eventData) {
  const cornerstone = external.cornerstone;
  const enabledElement = cornerstone.getEnabledElement(eventData.element);
  const context = getNewContext(enabledElement.canvas);
  const color = toolColors.getActiveColor();
  const fontHeight = textStyle.getFontSize();
  const config = dragProbe.getConfiguration();
  const x = Math.round(eventData.currentPoints.image.x);
  const y = Math.round(eventData.currentPoints.image.y);

  if (x < 0 || y < 0 || x >= eventData.image.columns || y >= eventData.image.rows) {
    return;
  }
  let str;
  const text = `${x}, ${y}`;

  if (eventData.image.color) {
    const rgbPixels = getRGBPixels(eventData.element, x, y, 1, 1);

    str = `R: ${rgbPixels[0]} G: ${rgbPixels[1]} B: ${rgbPixels[2]} A: ${rgbPixels[3]}`;
  } else {
    const storedPixels = cornerstone.getStoredPixels(eventData.element, x, y, 1, 1);
    const sp = storedPixels[0];
    const mo = sp * eventData.image.slope + eventData.image.intercept;
    const suv = calculateSUV(eventData.image, sp);

    // Draw text
    str = `SP: ${sp} MO: ${parseFloat(mo.toFixed(3))}`;
    if (suv) {
      str += ` SUV: ${parseFloat(suv.toFixed(3))}`;
    }
  }
  // Draw text
  const coords = {
    // Translate the x/y away from the cursor
    x: eventData.currentPoints.image.x + 3,
    y: eventData.currentPoints.image.y - 3
  };

  draw(context, (context) => {
    setShadow(context, config);
    drawTextBox(context, eventData.element, str, coords, 0, fontHeight + 5, color, { pixelCoords: false });
    drawTextBox(context, eventData.element, text, coords, 0, 0, color, { pixelCoords: false });
  });
}

function minimalStrategy (eventData) {
  const cornerstone = external.cornerstone;
  const element = eventData.element;
  const enabledElement = cornerstone.getEnabledElement(element);
  const image = enabledElement.image;
  const context = getNewContext(enabledElement.canvas);
  const color = toolColors.getActiveColor();
  const config = dragProbe.getConfiguration();
  const seriesModule = cornerstone.metaData.get('generalSeriesModule', image.imageId);
  let modality;

  if (seriesModule) {
    modality = seriesModule.modality;
  }

  let toolCoords;

  if (eventData.isTouchEvent === true) {
    toolCoords = cornerstone.pageToPixel(element, eventData.currentPoints.page.x,
      eventData.currentPoints.page.y - textStyle.getFontSize() * 4);
  } else {
    toolCoords = cornerstone.pageToPixel(element, eventData.currentPoints.page.x,
      eventData.currentPoints.page.y - textStyle.getFontSize() / 2);
  }

  let storedPixels;
  let text = '';

  if (!(toolCoords.x < 0 || toolCoords.y < 0 ||
        toolCoords.x >= image.columns || toolCoords.y >= image.rows)) {
    if (image.color) {
      storedPixels = getRGBPixels(element, toolCoords.x, toolCoords.y, 1, 1);
      text = `R: ${storedPixels[0]} G: ${storedPixels[1]} B: ${storedPixels[2]}`;
    } else {
      storedPixels = cornerstone.getStoredPixels(element, toolCoords.x, toolCoords.y, 1, 1);
      const sp = storedPixels[0];
      const mo = sp * eventData.image.slope + eventData.image.intercept;

      const modalityPixelValueText = parseFloat(mo.toFixed(2));

      if (modality === 'CT') {
        text += `HU: ${modalityPixelValueText}`;
      } else if (modality === 'PT') {
        text += modalityPixelValueText;
        const suv = calculateSUV(eventData.image, sp);

        if (suv) {
          text += ` SUV: ${parseFloat(suv.toFixed(2))}`;
        }
      } else {
        text += modalityPixelValueText;
      }
    }

    // Prepare text
    const handleRadius = 6;
    // Translate the x/y away from the cursor
    let translation;

    if (eventData.isTouchEvent) {
      translation = {
        x: -textBoxWidth(context, text),
        y: -textBoxHeight(context, text) - 2 * handleRadius
      };
    } else {
      translation = {
        x: 12,
        y: -textBoxHeight(context, text) / 2
      };
    }

    draw(context, (context) => {
      setShadow(context, config);
      drawCircle(context, element, toolCoords, handleRadius, { color });
      drawTextBox(context, element, text, toolCoords, translation.x, translation.y, color);
    });
  }
}

function mouseUpCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;

  element.removeEventListener(EVENTS.IMAGE_RENDERED, imageRenderedCallback);
  element.removeEventListener(EVENTS.MOUSE_DRAG, dragCallback);
  element.removeEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
  element.removeEventListener(EVENTS.MOUSE_CLICK, mouseUpCallback);
  external.cornerstone.updateImage(eventData.element);
}

function mouseDownCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;
  const options = getToolOptions(toolType, element);

  if (isMouseButtonEnabled(eventData.which, options.mouseButtonMask)) {
    element.addEventListener(EVENTS.IMAGE_RENDERED, imageRenderedCallback);
    element.addEventListener(EVENTS.MOUSE_DRAG, dragCallback);
    element.addEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
    element.addEventListener(EVENTS.MOUSE_CLICK, mouseUpCallback);
    dragProbe.strategy(eventData);

    e.preventDefault();
    e.stopPropagation();
  }
}

function imageRenderedCallback () {
  if (dragEventData) {
    dragProbe.strategy(dragEventData);
    dragEventData = null;
  }
}

// The strategy can't be execute at this moment because the image is rendered asynchronously
// (requestAnimationFrame). Then the eventData that contains all information needed is being
// Cached and the strategy will be executed once cornerstoneimagerendered is triggered.
function dragCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;

  dragEventData = eventData;
  external.cornerstone.updateImage(element);

  e.preventDefault();
  e.stopPropagation();
}

function touchStartCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;

  element.addEventListener(EVENTS.IMAGE_RENDERED, imageRenderedCallback);
}

function touchEndCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;

  element.removeEventListener(EVENTS.IMAGE_RENDERED, imageRenderedCallback);

  external.cornerstone.updateImage(element);
}

const dragProbe = simpleMouseButtonTool(mouseDownCallback, toolType);

dragProbe.strategies = {
  default: defaultStrategy,
  minimal: minimalStrategy
};

dragProbe.strategy = defaultStrategy;

const options = {
  fireOnTouchStart: true,
  touchStartCallback,
  touchEndCallback
};

const dragProbeTouch = touchDragTool(dragCallback, toolType, options);

export {
  dragProbe,
  dragProbeTouch
};
