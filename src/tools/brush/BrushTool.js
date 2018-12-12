import external from './../../externalModules.js';
import BaseBrushTool from './../base/BaseBrushTool.js';
import { getToolState } from './../../stateManagement/toolState.js';
import store from './../../store/index.js';
import brushUtils from './../../util/brush/index.js';

const { drawBrushPixels, getCircle } = brushUtils;
const { state } = store.modules.brush;

/**
 * @public
 * @class BrushTool
 * @memberof Tools.Brush
 * @classdesc Tool for drawing segmentations on an image.
 * @extends Tools.Base.BaseBrushTool
 */
export default class BrushTool extends BaseBrushTool {
  constructor(configuration = {}) {
    const defaultConfig = {
      name: 'Brush',
      supportedInteractionTypes: ['Mouse'],
      strategies: {
        overlapping: _overlappingStrategy,
        nonOverlapping: _nonOverlappingStrategy,
      },
      defaultStrategy: 'nonOverlapping',
      configuration: {},
    };
    const initialConfiguration = Object.assign(defaultConfig, configuration);

    super(initialConfiguration);

    this.initialConfiguration = initialConfiguration;
  }

  /**
   * Called by the event dispatcher to render the image.
   *
   * @param {Object} evt - The event.
   */
  renderBrush(evt) {
    const eventData = evt.detail;

    let mousePosition;

    if (this._drawing) {
      mousePosition = this._lastImageCoords;
    } else if (this._mouseUpRender) {
      mousePosition = this._lastImageCoords;
      this._mouseUpRender = false;
    } else {
      mousePosition = store.state.mousePositionImage;
    }

    if (!mousePosition) {
      return;
    }

    const { rows, columns } = eventData.image;
    const { x, y } = mousePosition;

    if (x < 0 || x > columns || y < 0 || y > rows) {
      return;
    }

    // Draw the hover overlay on top of the pixel data
    const configuration = this._configuration;
    const radius = state.radius;
    const context = eventData.canvasContext;
    const element = eventData.element;
    const drawId = state.drawColorId;
    const color = this._getBrushColor(drawId);

    context.setTransform(1, 0, 0, 1, 0, 0);

    const { cornerstone } = external;
    const mouseCoordsCanvas = cornerstone.pixelToCanvas(element, mousePosition);
    const canvasTopLeft = cornerstone.pixelToCanvas(element, {
      x: 0,
      y: 0,
    });
    const radiusCanvas = cornerstone.pixelToCanvas(element, {
      x: radius,
      y: 0,
    });
    const circleRadius = Math.abs(radiusCanvas.x - canvasTopLeft.x);

    context.beginPath();
    context.strokeStyle = color;
    context.ellipse(
      mouseCoordsCanvas.x,
      mouseCoordsCanvas.y,
      circleRadius,
      circleRadius,
      0,
      0,
      2 * Math.PI
    );
    context.stroke();
  }

  /**
   * Paints the data to the canvas.
   *
   * @private
   * @param  {Object} eventData The data object associated with the event.
   */
  _paint(evt) {
    this.applyActiveStrategy(evt, this.configuration);

    external.cornerstone.updateImage(evt.detail.element);
  }
}

function _overlappingStrategy(evt, configuration) {
  const eventData = evt.detail;
  const element = eventData.element;
  const { rows, columns } = eventData.image;
  const { x, y } = eventData.currentPoints.image;
  const toolData = getToolState(element, configuration.referencedToolData);

  let shouldErase = false;

  // Check for key, could be a mouseDown or mouseDrag event.
  if (_isCtrlDown(eventData)) {
    console.log('ctrlDown');
    shouldErase = true;
  }

  const segmentationIndex = state.drawColorId;

  if (!toolData.data[segmentationIndex].pixelData) {
    const newPixelData = new Uint8ClampedArray(
      eventData.image.width * eventData.image.height
    );

    toolData.data[segmentationIndex].pixelData = newPixelData;
  }

  const pixelData = toolData.data[segmentationIndex].pixelData;

  const radius = state.radius;

  if (x < 0 || x > columns || y < 0 || y > rows) {
    return;
  }

  const pointerArray = getCircle(radius, rows, columns, x, y);

  drawBrushPixels(pointerArray, pixelData, columns, shouldErase);

  toolData.data[segmentationIndex].invalidated = true;
}

function _nonOverlappingStrategy(evt, configuration) {
  const eventData = evt.detail;
  const element = eventData.element;
  const { rows, columns } = eventData.image;
  const { x, y } = eventData.currentPoints.image;
  const toolState = getToolState(element, configuration.referencedToolData);
  const toolData = toolState.data;

  let shouldErase = false;

  // Check for key, could be a mouseDown or mouseDrag event.
  if (_isCtrlDown(eventData)) {
    console.log('ctrlDown');
    shouldErase = true;
  }

  const activeSegmentationIndex = state.drawColorId;

  if (!toolData[activeSegmentationIndex].pixelData) {
    const newPixelData = new Uint8ClampedArray(
      eventData.image.width * eventData.image.height
    );

    toolData[activeSegmentationIndex].pixelData = newPixelData;
  }

  const pixelData = toolData[activeSegmentationIndex].pixelData;

  const radius = state.radius;

  if (x < 0 || x > columns || y < 0 || y > rows) {
    return;
  }

  const pointerArray = getCircle(radius, rows, columns, x, y);

  // Draw / Erase the active color.
  drawBrushPixels(pointerArray, pixelData, columns, shouldErase);

  toolData[activeSegmentationIndex].invalidated = true;

  const numberOfColors = BaseBrushTool.getNumberOfColors();

  // If there is brush data in this region for other colors, delete it.
  for (let i = 0; i < numberOfColors; i++) {
    if (i === activeSegmentationIndex) {
      continue;
    }

    if (toolData[i] && toolData[i].pixelData) {
      drawBrushPixels(pointerArray, toolData[i].pixelData, columns, true);
      toolData[i].invalidated = true;
    }
  }
}

function _isCtrlDown(eventData) {
  return (eventData.event && eventData.event.ctrlKey) || eventData.ctrlKey;
}
