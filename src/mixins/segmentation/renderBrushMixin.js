import external from './../../externalModules.js';
import store, { getModule } from './../../store/index.js';

/**
 * Called by the event dispatcher to render the image.
 *
 * @param {Object} evt - The event.
 * @returns {void}
 */
function renderBrush(evt) {
  const { cornerstone } = external;
  const { getters, configuration } = getModule('segmentation');
  const eventData = evt.detail;
  const viewport = eventData.viewport;

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
  const radius = configuration.radius;
  const context = eventData.canvasContext;
  const element = eventData.element;
  const color = getters.brushColor(element, this._drawing);

  context.setTransform(1, 0, 0, 1, 0, 0);

  const circleRadius = radius * viewport.scale;
  const mouseCoordsCanvas = cornerstone.pixelToCanvas(element, mousePosition);

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

export default {
  renderBrush,
};
