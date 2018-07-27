import external from './../externalModules.js';
import baseTool from './../base/baseTool.js';
import { draw, drawRect, getNewContext } from '../util/drawing.js';
import clip from '../util/clip.js';
import getLuminance from '../util/getLuminance.js';
import toolColors from './../stateManagement/toolColors.js';

const cornerstone = external.cornerstone;

/** Calculates the minimum, maximum, and mean value in the given pixel array */
const calculateMinMaxMean = (storedPixelLuminanceData, globalMin, globalMax) => {
  const numPixels = storedPixelLuminanceData.length;

  if (numPixels < 2) {
    return {
      min: globalMin,
      max: globalMax,
      mean: (globalMin + globalMax) / 2
    };
  }

  let min = globalMax;
  let max = globalMin;
  let sum = 0;

  for (let index = 0; index < numPixels; index++) {
    const spv = storedPixelLuminanceData[index];

    min = Math.min(min, spv);
    max = Math.max(max, spv);
    sum += spv;
  }

  return {
    min,
    max,
    mean: sum / numPixels
  };
};

/** Calculates the minimum and maximum value in the given pixel array */
const applyWWWCRegion = (evt, config) => {
  const eventData = evt.detail;
  const { image, element } = eventData;
  const { start: startPoint, end: endPoint } = evt.detail.handles;

  // Get the rectangular region defined by the handles
  let left = Math.min(startPoint.x, endPoint.x);
  let top = Math.min(startPoint.y, endPoint.y);
  let width = Math.abs(startPoint.x - endPoint.x);
  let height = Math.abs(startPoint.y - endPoint.y);

  // Bound the rectangle so we don't get undefined pixels
  left = clip(left, 0, image.width);
  top = clip(top, 0, image.height);
  width = Math.floor(Math.min(width, Math.abs(image.width - left)));
  height = Math.floor(Math.min(height, Math.abs(image.height - top)));

  // Get the pixel data in the rectangular region
  const pixelLuminanceData = getLuminance(element, left, top, width, height);

  // Calculate the minimum and maximum pixel values
  const minMaxMean = calculateMinMaxMean(pixelLuminanceData, image.minPixelValue, image.maxPixelValue);

  // Adjust the viewport window width and center based on the calculated values
  const viewport = eventData.viewport;

  if (config.minWindowWidth === undefined) {
    config.minWindowWidth = 10;
  }

  viewport.voi.windowWidth = Math.max(Math.abs(minMaxMean.max - minMaxMean.min), config.minWindowWidth);
  viewport.voi.windowCenter = minMaxMean.mean;

  external.cornerstone.setViewport(element, viewport);

  cornerstone.updateImage(element);
};

export default class extends baseTool {
  constructor (name) {
    const strategies = {
      applyWWWCRegion
    };

    super({
      name: name || 'wwwcRegion',
      strategies,
      supportedInteractionTypes: ['mouse', 'touch'],
      configuration: {
        minWindowWidth: 10
      }
    });

  }

  mouseDragCallback (evt) {
    const eventData = evt.detail;
    const element = eventData.element;

    this.handles = {
      start: {
        x: eventData.startPoints.image.x,
        y: eventData.startPoints.image.y
      },
      end: {
        x: eventData.currentPoints.image.x,
        y: eventData.currentPoints.image.y
      }
    };

    cornerstone.updateImage(element);
  }

  mouseDragEndCallback (evt) {
    evt.detail.handles = this.handles;
    this.handles = {};
    this.applyActiveStrategy(evt);
  }


  touchDragCallback (evt) {
    // Prevent CornerstoneToolsTouchStartActive from killing any press events
    evt.stopImmediatePropagation();
    evt.detail.handles = this.handles;
    this.handles = {};
    this.applyActiveStrategy(evt);
  }

  renderToolData (evt) {
    if(this.handles && this.handles.start && this.handles.end) {
      const eventData = evt.detail;
      const { element } = eventData;
      const color = toolColors.getColorIfActive({ active: true });
      const context = getNewContext(eventData.canvasContext.canvas);

      draw(context, (context) => {
        drawRect(context, element, this.handles.start, this.handles.end, { color });
      });
    }
  }
}
