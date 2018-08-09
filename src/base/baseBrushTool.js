import external from './../externalModules.js';
import EVENTS from './../events.js';
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

    this._drawingMouseUpCallback = this._drawingMouseUpCallback.bind(this);
  }

  //===================================================================
  // Abstract Methods - Must be implemented.
  //===================================================================

  /**
  * Helper function for rendering the brush.
  *
  * @abstract
  * @param {Object} evt - The event.
  */
  renderBrush (evt) {
    throw new Error(`Method renderBrush not implemented for ${this.toolName}.`);
  }

  /**
   * Paints the data to the canvas.
   *
   * @protected
   * @abstract
   * @param  {Object} eventData The data object associated with the event.
   */
  _paint (eventData) {
    throw new Error(`Method renderBrush not implemented for ${this.toolName}.`);
  }

  //===================================================================
  // Virtual Methods - Have default behavior but may be overriden.
  //===================================================================

  /**
   * Callback for when the tool is activated.
   *
   * @virtual
   */
  activeCallback () {
    const configuration = this.configuration;

    this._changeDrawColor(configuration.draw);
  }

  /**
  * Event handler for MOUSE_DRAG event.
  *
  * @virtual
  * @event
  * @param {Object} evt - The event.
  */
  mouseDragCallback (evt) {
    this._startPainting(evt);
  }

  /**
  * Event handler for MOUSE_DOWN event.
  *
  * @virtual
  * @event
  * @param {Object} evt - The event.
  */
  postMouseDownCallback (evt) {
    this._startPainting(evt);

    evt.preventDefault();
    evt.stopPropagation();
    evt.stopImmediatePropagation();
  }

  /**
  * Initialise painting with baseBrushTool
  *
  * @protected
  * @virtual
  * @event
  * @param {Object} evt - The event.
  */
  _startPainting (evt) {
    const eventData = evt.detail;
    const element = eventData.element;

    this._paint(eventData);
    this.configuration.drawing = true;
    this._startListeningForMouseUp(element);
    this._lastImageCoords = eventData.currentPoints.image;
  }

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
  * @param {Object} evt - The event.
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

  /**
   * Draws the ImageBitmap the canvas.
   *
   * @protected
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
   * @protected
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
  * Event handler for MOUSE_UP during the drawing event loop.
  *
  * @protected
  * @event
  * @param {Object} evt - The event.
  */
  _drawingMouseUpCallback(evt) {
    const eventData = evt.detail;
    const element = eventData.element;

    this.configuration.drawing = false;
    this.configuration.mouseUpRender = true;

    this._stopListeningForMouseUp(element);
  }
  /**
  * Adds modify loop event listeners.
  *
  * @protected
  * @param {Object} element - The viewport element to add event listeners to.
  * @modifies {element}
  */
  _startListeningForMouseUp (element) {
    element.removeEventListener(EVENTS.MOUSE_UP, this._drawingMouseUpCallback);
    element.removeEventListener(EVENTS.MOUSE_CLICK, this._drawingMouseUpCallback);

    element.addEventListener(EVENTS.MOUSE_UP, this._drawingMouseUpCallback);
    element.addEventListener(EVENTS.MOUSE_CLICK, this._drawingMouseUpCallback);

    external.cornerstone.updateImage(element);
  }

  /**
  * Adds modify loop event listeners.
  *
  * @protected
  * @param {Object} element - The viewport element to add event listeners to.
  * @modifies {element}
  */
  _stopListeningForMouseUp (element) {
    element.removeEventListener(EVENTS.MOUSE_UP, this._drawingMouseUpCallback);
    element.removeEventListener(EVENTS.MOUSE_CLICK, this._drawingMouseUpCallback);

    external.cornerstone.updateImage(element);
  }


  /**
   * Returns the number of colors in the colormap.
   *
   * @static
   * @protected
   * @return {Number} The number of colors in the color map.
   */
  static _getNumberOfColors () {
    const colormap = external.cornerstone.colors.getColormap(COLOR_MAP_ID);

    return colormap.getNumberOfColors();
  }

  /**
   * Sets the keybinds for the tool. // TODO: If this will be used in other
   * tools, maybe it should be stored in a different module and imported?
   *
   */
  set keyBinds (keyBinds) {
    const configuration = this.configuration;

    configuration.keyBinds = keyBinds;
    this._keyboardController = new KeyboardController(this, keyBinds);
  }
}
