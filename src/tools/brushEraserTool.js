import EVENTS from './../events.js';
import external from './../externalModules.js';
import BaseBrushTool from './../base/BaseBrushTool.js';
import toolColors from './../stateManagement/toolColors.js';
// Utils
import getCircle from './shared/brushUtils/getCircle.js';
import { drawBrushPixels } from './shared/brushUtils/drawBrush.js';
// State
import { getToolState, addToolState } from './../stateManagement/toolState.js';
import store from '../store/index.js';
import { getters } from './../store/index.js';

const brushState = store.modules.brush;

export default class BrushEraserTool extends BaseBrushTool {
  constructor (name = 'BrushEraser') {
    super({
      name,
      supportedInteractionTypes: ['mouse'],
      configuration: defaultBrushConfiguration()
    });
  }

  /**
  * Called by the event dispatcher to render the image.
  *
  * @param {Object} evt - The event.
  */
  renderBrush (evt) {
    // Render the brush
    const eventData = evt.detail;
    const configuration = this._configuration;

    let mousePosition;

    if (this._drawing) {
      mousePosition = this._lastImageCoords;
    } else if (configuration.mouseUpRender) {
      mousePosition = this._lastImageCoords;
      configuration.mouseUpRender = false;
    } else {
      mousePosition = getters.mousePositionImage();
    }

    if (!mousePosition) {
      return;
    }

    const { rows, columns } = eventData.image;
    const { x, y } = mousePosition;

    if (x < 0 || x > columns ||
      y < 0 || y > rows) {
      return;
    }

    // Draw the hover overlay on top of the pixel data

    const radius = brushState.getters.radius();
    const context = eventData.canvasContext;

    const color = this._drawing ? configuration.dragColor : configuration.hoverColor;
    const element = eventData.element;

    context.setTransform(1, 0, 0, 1, 0, 0);

    const { cornerstone } = external;
    const mouseCoordsCanvas = cornerstone.pixelToCanvas(element, mousePosition);
    const canvasTopLeft = cornerstone.pixelToCanvas(element, {
      x: 0,
      y: 0
    });
    const radiusCanvas = cornerstone.pixelToCanvas(element, {
      x: radius,
      y: 0
    });
    const circleRadius = Math.abs(radiusCanvas.x - canvasTopLeft.x);

    context.beginPath();
    context.strokeStyle = color;
    context.ellipse(mouseCoordsCanvas.x, mouseCoordsCanvas.y, circleRadius, circleRadius, 0, 0, 2 * Math.PI);
    context.stroke();
  }

  /**
   * Paints the data to the canvas.
   *
   * @private
   * @param  {Object} eventData The data object associated with the event.
   */
  _paint (eventData) {
    const configuration = this.configuration;
    const element = eventData.element;
    const { rows, columns } = eventData.image;
    const { x, y } = eventData.currentPoints.image;
    let toolData = getToolState(element, this.referencedToolData);

    let pixelData;

    if (toolData) {
      pixelData = toolData.data[0].pixelData;
    } else {
      pixelData = new Uint8ClampedArray(eventData.image.width * eventData.image.height);
      addToolState(element, this.referencedToolData, { pixelData });
      toolData = getToolState(element, this.referencedToolData);
    }

    const radius = brushState.getters.radius();

    if (x < 0 || x > columns ||
      y < 0 || y > rows) {
      return;
    }

    const pointerArray = getCircle(radius, rows, columns, x, y);

    drawBrushPixels(pointerArray, pixelData, 0, columns);

    toolData.data[0].invalidated = true;

    external.cornerstone.updateImage(eventData.element);
  }

}

function defaultBrushConfiguration () {
  return {
    hoverColor: 'rgba(255, 255, 255, 0.8 )',
    dragColor: 'rgba(255, 255, 255, 1.0 )',
    keyBinds: {
      increaseBrushSize: '+',
      decreaseBrushSize: '-'
    }
  };
}
