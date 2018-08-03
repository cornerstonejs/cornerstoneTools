import external from './../externalModules.js';
import baseTool from './../base/baseTool.js';
// Utils
import KeyboardController from '../fancy-tools/shared/KeyboardController.js';
import isToolActive from '../fancy-tools/shared/isToolActive.js';
import { getNewContext } from '../util/drawing.js';
import { COLOR_MAP_ID } from '../stateManagement/brushToolColors.js';

export default class extends baseTool {
  constructor ({
    name,
    strategies,
    defaultStrategy,
    configuration,
    supportedInteractionTypes
  }) {
    super({
      name,
      strategies,
      defaultStrategy,
      configuration,
      supportedInteractionTypes
    });

    this.isBrushTool = true;
    this.hasCursor = true;
    this._referencedToolData = 'brush';
    this._dragging = false;
    this._newImage = false;
  }

  //===================================================================
  // Abstract Methods - Must be implemented.
  //===================================================================

  /**
  * Event handler for NEW_IMAGE event.
  *
  * @abstract
  * @event
  * @param {Object} evt - The event.
  */
  onNewImageCallback (evt) {
    throw new Error(`Method onNewImageCallback not implemented for ${this.toolName}.`);
  }

  /**
  * Event handler for MOUSE_DRAG event.
  *
  * @abstract
  * @event
  * @param {Object} evt - The event.
  */
  mouseDragCallback (evt) {
    throw new Error(`Method mouseDragCallback not implemented for ${this.toolName}.`);
  }

  /**
  * Event handler for MOUSE_DRAG event.
  *
  * @abstract
  * @event
  * @param {Object} evt - The event.
  */
  mouseDownCallback (evt) {
    throw new Error(`Method mouseDownCallback not implemented for ${this.toolName}.`);
  }

  /**
  * Helper function for rendering the brush.
  *
  * @abstract
  * @param {Object} evt - The event.
  */
  renderBrush (evt) {
    throw new Error(`Method renderBrush not implemented for ${this.toolName}.`);
  }

  //===================================================================
  // Virtual Methods - Have default behavior but may be overriden.
  //===================================================================


  /**
  * Event handler for MOUSE_MOVE event.
  *
  * @virtual
  * @event
  * @param {Object} evt - The event.
  */
  mouseMoveCallback (evt) {
    const { currentPoints } = evt.detail;
    this._lastImageCoords = currentPoints.image;
  }

  /**
  * Used to redraw the tool's annotation data per render.
  *
  * @virtual
  * @param {*} evt
  */
  renderToolData (evt) {
    const eventData = evt.detail;
    const element = eventData.element;

    // Only brush needs to render.
    if (isToolActive(element, this.name)) {
      // Call the hover event for the brush
      this.renderBrush(evt);
    }
  }

  /**
  * Switches to the next segmentation color.
  *
  * @virtual
  */
  nextSegmentation () {
    const configuration = this.configuration;
    const numberOfColors = this.constructor._getNumberOfColors();

    let drawId = configuration.draw + 1;

    if (drawId === numberOfColors) {
      drawId = 1;
    }

    this._changeDrawColor(drawId);
  }

  /**
  * Switches to the previous segmentation color.
  *
  * @virtual
  */
  previousSegmentation () {
    const configuration = this.configuration;
    const numberOfColors = this.constructor._getNumberOfColors();

    let drawId = configuration.draw - 1;

    if (drawId < 1) {
      drawId = numberOfColors - 1;
    }

    this._changeDrawColor(drawId);
  }

  /**
  * Increases the brush size
  *
  * @virtual
  */
  increaseBrushSize () {
    const configuration = this.configuration;

    const oldRadius = configuration.radius;
    let newRadius = Math.floor(oldRadius * 1.2);

    // If e.g. only 2 pixels big. Math.floor(2*1.2) = 2.
    // Hence, have minimum increment of 1 pixel.
    if (newRadius === oldRadius) {
      newRadius += 1;
    }

    if (newRadius > configuration.maxRadius) {
      newRadius = configuration.maxRadius;
    }

    configuration.radius = newRadius;
  }

  /**
  * Decreases the brush size
  *
  * @virtual
  */
  decreaseBrushSize () {
    const configuration = this.configuration;

    const oldRadius = configuration.radius;
    let newRadius = Math.floor(oldRadius * 0.8);

    if (newRadius < configuration.minRadius) {
      newRadius = configuration.minRadius;
    }

    configuration.radius = newRadius;
  }

  //===================================================================
  // Implementation interface
  //===================================================================

  /**
  * Event handler for KEY_DOWN event.
  *
  * @event
  * @param {Object} evt - The event.
  */
  onKeyDown (evt) {
    const eventData = evt.detail;
    const element = eventData.element;
    const keyCode = eventData.keyCode;

    if (!isToolActive(element, this.name) || !this._keyboardController) {
      return;
    }

    const imageNeedsUpdate = this._keyboardController.keyPress(keyCode);

    if (imageNeedsUpdate) {
      external.cornerstone.updateImage(element);
    }
  }

  activeCallback () {
    const configuration = this.configuration;

    this._changeDrawColor(configuration.draw);
  }


  /**
   * Draws the ImageBitmap the canvas.
   *
   * @private
   * @param  {Object} evt description
   */
  _drawImageBitmap (evt) {
    const configuration = this.configuration;
    const eventData = evt.detail;
    const context = getNewContext(eventData.canvasContext.canvas);

    const canvasTopLeft = external.cornerstone.pixelToCanvas(eventData.element, {
      x: 0,
      y: 0
    });
    const canvasBottomRight = external.cornerstone.pixelToCanvas(eventData.element, {
      x: eventData.image.width,
      y: eventData.image.height
    });
    const canvasWidth = canvasBottomRight.x - canvasTopLeft.x;
    const canvasHeight = canvasBottomRight.y - canvasTopLeft.y;

    context.imageSmoothingEnabled = false;
    context.globalAlpha = configuration.brushAlpha;
    context.drawImage(this._imageBitmap, canvasTopLeft.x, canvasTopLeft.y, canvasWidth, canvasHeight);
    context.globalAlpha = 1.0;
  }


  /**
   *  Changes the draw color (segmentation) of the tool.
   *
   * @private
   * @param  {Number} drawId The id of the color (segmentation) to switch to.
   */
  _changeDrawColor (drawId) {
    const configuration = this._configuration;
    const colormap = external.cornerstone.colors.getColormap(COLOR_MAP_ID);

    configuration.draw = drawId;
    const colorArray = colormap.getColor(configuration.draw);

    configuration.hoverColor = `rgba(${colorArray[[0]]}, ${colorArray[[1]]}, ${colorArray[[2]]}, 0.8 )`;
    configuration.dragColor = `rgba(${colorArray[[0]]}, ${colorArray[[1]]}, ${colorArray[[2]]}, 1.0 )`;
  }


  /**
   * Returns the number of colors in the colormap.
   *
   * @static
   * @private
   * @return {Number} The number of colors in the color map.
   */
  static _getNumberOfColors () {
    const colormap = external.cornerstone.colors.getColormap(COLOR_MAP_ID);

    return colormap.getNumberOfColors();
  }

  set keyBinds (keyBinds) {
    const configuration = this.configuration;

    configuration.keyBinds = keyBinds;
    this._keyboardController = new KeyboardController(this, keyBinds);
  }
}
