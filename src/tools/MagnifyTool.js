/* eslint no-underscore-dangle: 0 */
/* eslint class-methods-use-this: 0 */
import external from '../externalModules.js';
import { getBrowserInfo } from '../util/getMaxSimultaneousRequests.js';
import { clipToBox } from '../util/clip.js';
import { getNewContext, fillBox } from '../util/drawing.js';
import BaseTool from '../base/BaseTool.js';

export default class MagnifyTool extends BaseTool {
  constructor (name = 'Magnify') {
    super({
      name,
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: {
        magnifySize: 300,
        magnificationLevel: 2
      }
    });

    this.browserName = undefined;
    this.zoomCanvas = undefined;
    this.zoomElement = undefined;

    // Needed for Safari Canvas Hack
    if (!this.browserName) {
      const infoString = getBrowserInfo();
      const info = infoString.split(' ');

      this.browserName = info[0];
    }

    // Mode Callbacks: (element, options)
    this.activeCallback = this._createMagnificationCanvas.bind(this);
    this.enableCallback = this._createMagnificationCanvas.bind(this);
    this.disableCallback = this._destroyMagnificationCanvas.bind(this);

    // Touch
    this.postTouchStartCallback = this._addMagnifyingGlass.bind(this);
    this.touchDragCallback = this._updateMagnifyingGlass.bind(this);
    this.touchEndCallback = this._removeMagnifyingGlass.bind(this);
    this.touchDragEndCallback = this._removeMagnifyingGlass.bind(this);
    // Mouse
    this.postMouseDownCallback = this._addMagnifyingGlass.bind(this);
    this.mouseDragCallback = this._updateMagnifyingGlass.bind(this);
    this.mouseUpCallback = this._removeMagnifyingGlass.bind(this);
    // On quick clicks, mouseUp does not fire, but this does
    this.mouseClickCallback = this._removeMagnifyingGlass.bind(this);
    // Misc
    this.newImageCallback = this._drawMagnificationTool.bind(this);
  }

  _addMagnifyingGlass (evt) {
    // Ignore until next event
    this._removeZoomElement();
    this._drawZoomedElement(evt);
    // On next frame
    window.requestAnimationFrame(() => this._drawMagnificationTool(evt));

    evt.preventDefault();
    evt.stopPropagation();
  }

  _updateMagnifyingGlass (evt) {
    this._drawMagnificationTool(evt);

    evt.preventDefault();
    evt.stopPropagation();
  }

  _removeMagnifyingGlass (evt) {
    const element = evt.detail.element;

    element.querySelector('.magnifyTool').style.display = 'none';
    // Re-enable the mouse cursor
    document.body.style.cursor = 'default';
    this._removeZoomElement();
  }

  _drawMagnificationTool (evt) {
    const element = evt.detail.element;
    const magnifyCanvas = element.querySelector('.magnifyTool');

    if (!magnifyCanvas) {
      this._createMagnificationCanvas(element);
    }

    if (this.zoomCanvas === undefined) {
      return;
    }

    const magnifySize = this.configuration.magnifySize;
    const magnificationLevel = this.configuration.magnificationLevel;

    // The 'not' magnifyTool class here is necessary because cornerstone places
    // No classes of it's own on the canvas we want to select
    const canvas = element.querySelector('canvas:not(.magnifyTool)');
    const context = getNewContext(magnifyCanvas);
    const getSize = magnifySize;

    // Calculate the on-canvas location of the mouse pointer / touch
    const canvasLocation = external.cornerstone.pixelToCanvas(
      evt.detail.element,
      evt.detail.currentPoints.image
    );

    clipToBox(canvasLocation, canvas);

    // Clear the rectangle
    context.clearRect(0, 0, magnifySize, magnifySize);

    // Fill it with the pixels that the mouse is clicking on
    const boundingBox = {
      left: 0,
      top: 0,
      width: magnifySize,
      height: magnifySize
    };

    fillBox(context, boundingBox, 'transparent');

    const copyFrom = {
      x: canvasLocation.x * magnificationLevel - 0.5 * getSize,
      y: canvasLocation.y * magnificationLevel - 0.5 * getSize
    };

    if (this.browserName === 'Safari') {
      // Safari breaks when trying to copy pixels with negative indices
      // This prevents proper Magnify usage
      copyFrom.x = Math.max(copyFrom.x, 0);
      copyFrom.y = Math.max(copyFrom.y, 0);
    }

    copyFrom.x = Math.min(copyFrom.x, this.zoomCanvas.width);
    copyFrom.y = Math.min(copyFrom.y, this.zoomCanvas.height);

    context.drawImage(
      this.zoomCanvas,
      copyFrom.x,
      copyFrom.y,
      getSize,
      getSize,
      0,
      0,
      getSize,
      getSize
    );

    // Place the magnification tool at the same location as the pointer
    magnifyCanvas.style.top = `${canvasLocation.y - 0.5 * magnifySize}px`;
    magnifyCanvas.style.left = `${canvasLocation.x - 0.5 * magnifySize}px`;

    if (evt.detail.isTouchEvent) {
      magnifyCanvas.style.top = `${canvasLocation.y -
        0.5 * magnifySize -
        120}px`;
    }

    magnifyCanvas.style.display = 'block';
    // Hide the mouse cursor, so the user can see better
    document.body.style.cursor = 'none';
  }

  /**
   * Creates a cornerstone enabled element, and renders the target image at the
   * desired magnification level using it.
   *
   * @param {*} evt
   */
  _drawZoomedElement (evt) {
    const element = evt.detail.element;
    let enabledElement = evt.detail.enabledElement;

    if (enabledElement === undefined) {
      enabledElement = external.cornerstone.getEnabledElement(element);
    }

    const magnificationLevel = this.configuration.magnificationLevel;
    const origCanvas = enabledElement.canvas;
    const image = enabledElement.image;

    // Create a new cornerstone enabledElement
    this.zoomElement = document.createElement('div');
    this.zoomElement.width = origCanvas.width * magnificationLevel;
    this.zoomElement.height = origCanvas.height * magnificationLevel;
    external.cornerstone.enable(this.zoomElement);

    const zoomEnabledElement = external.cornerstone.getEnabledElement(this.zoomElement);
    const viewport = external.cornerstone.getViewport(enabledElement.element);

    this.zoomCanvas = zoomEnabledElement.canvas;
    this.zoomCanvas.width = origCanvas.width * magnificationLevel;
    this.zoomCanvas.height = origCanvas.height * magnificationLevel;

    zoomEnabledElement.viewport = Object.assign({}, viewport);

    // Update it's viewport to render at desired magnification level
    viewport.scale *= magnificationLevel;
    external.cornerstone.displayImage(this.zoomElement, image);
    external.cornerstone.setViewport(this.zoomElement, viewport);
  }

  /**
   * Removes the canvas and associated enabled element that's
   * used to render the zoomed image.
   *
   */
  _removeZoomElement () {
    if (this.zoomElement !== undefined) {
      external.cornerstone.disable(this.zoomElement);
      this.zoomElement = undefined;
      this.zoomCanvas = undefined;
    }
  }

  /**
   * The canvas used to render the zoomed image.
   * It will be displayed and clipped inside the magnifying glass frame/element.
   *
   * @param {*} element
   */
  _createMagnificationCanvas (element) {
    // If the magnifying glass canvas doesn't already exist
    if (element.querySelector('.magnifyTool') === null) {
      // Create a canvas and append it as a child to the element
      const magnifyCanvas = document.createElement('canvas');

      // The magnifyTool class is used to find the canvas later on
      // Make sure position is absolute so the canvas can follow the mouse / touch
      magnifyCanvas.classList.add('magnifyTool');
      magnifyCanvas.width = this.configuration.magnifySize;
      magnifyCanvas.height = this.configuration.magnifySize;
      magnifyCanvas.style.position = 'absolute';
      magnifyCanvas.style.display = 'none';
      element.appendChild(magnifyCanvas);
    }
  }

  /**
   *
   *
   * @param {*} evt
   */
  _destroyMagnificationCanvas (evt) {
    const element = evt.detail.element;
    const magnifyCanvas = element.querySelector('.magnifyTool');

    if (magnifyCanvas) {
      element.removeChild(magnifyCanvas);
    }
  }
}
