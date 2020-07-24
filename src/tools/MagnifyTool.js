import external from '../externalModules.js';
import { getNewContext } from '../drawing/index.js';
import BaseTool from './base/BaseTool.js';
import { hideToolCursor, setToolCursor } from '../store/setToolCursor.js';
import { magnifyCursor } from './cursors/index.js';

/**
 * @public
 * @class MagnifyTool
 * @memberof Tools
 *
 * @classdesc Tool for inspecting a region at increased magnification.
 * @extends Tools.Base.BaseTool
 */
export default class MagnifyTool extends BaseTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'Magnify',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: {
        magnifySize: 300,
        magnificationLevel: 2,
      },
      svgCursor: magnifyCursor,
    };

    super(props, defaultProps);

    this.zoomCanvas = undefined;
    this.zoomElement = undefined;

    // Mode Callbacks: (element, options)
    this.activeCallback = this._createMagnificationCanvas.bind(this);
    this.enabledCallback = this._createMagnificationCanvas.bind(this);
    this.disabledCallback = this._destroyMagnificationCanvas.bind(this);

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

  _addMagnifyingGlass(evt) {
    // Ignore until next event
    this._removeZoomElement();
    this._drawZoomedElement(evt);
    // On next frame
    window.requestAnimationFrame(() => this._drawMagnificationTool(evt));

    hideToolCursor(evt.detail.element);

    evt.preventDefault();
    evt.stopPropagation();
  }

  _updateMagnifyingGlass(evt) {
    this._drawMagnificationTool(evt);

    evt.preventDefault();
    evt.stopPropagation();
  }

  _removeMagnifyingGlass(evt) {
    const element = evt.detail.element;

    // Re-enable the mouse cursor
    setToolCursor(this.element, this.svgCursor);

    element.querySelector('.magnifyTool').style.display = 'none';
    this._removeZoomElement();
  }

  _drawMagnificationTool(evt) {
    const element = evt.detail.element;
    const magnifyCanvas = element.querySelector('.magnifyTool');

    if (!magnifyCanvas) {
      this._createMagnificationCanvas(element);
    }

    if (this.zoomCanvas === undefined) {
      return;
    }

    // The 'not' magnifyTool class here is necessary because cornerstone places
    // No classes of it's own on the canvas we want to select
    const canvas = element.querySelector('canvas:not(.magnifyTool)');
    const context = getNewContext(magnifyCanvas);

    // Calculate the on-canvas location of the mouse pointer / touch
    const canvasLocation = external.cornerstone.pixelToCanvas(
      evt.detail.element,
      evt.detail.currentPoints.image
    );

    // Shrink magnifier to smallest canvas dimension if smaller than desired magnifier size
    const magnifySize = Math.min(
      this.configuration.magnifySize,
      canvas.width,
      canvas.height
    );
    const magnificationLevel = this.configuration.magnificationLevel;

    magnifyCanvas.width = magnifySize;
    magnifyCanvas.height = magnifySize;

    // Constrain drag movement to zoomed image boundaries
    canvasLocation.x = Math.max(
      canvasLocation.x,
      (0.5 * magnifySize) / magnificationLevel
    );
    canvasLocation.x = Math.min(
      canvasLocation.x,
      canvas.width - (0.5 * magnifySize) / magnificationLevel
    );
    canvasLocation.y = Math.max(
      canvasLocation.y,
      (0.5 * magnifySize) / magnificationLevel
    );
    canvasLocation.y = Math.min(
      canvasLocation.y,
      canvas.height - (0.5 * magnifySize) / magnificationLevel
    );

    const copyFrom = {
      x: canvasLocation.x * magnificationLevel - 0.5 * magnifySize,
      y: canvasLocation.y * magnificationLevel - 0.5 * magnifySize,
    };

    copyFrom.x = Math.max(copyFrom.x, 0);
    copyFrom.y = Math.max(copyFrom.y, 0);

    context.drawImage(
      this.zoomCanvas,
      copyFrom.x,
      copyFrom.y,
      magnifySize,
      magnifySize,
      0,
      0,
      magnifySize,
      magnifySize
    );

    // Place the magnification tool at the same location as the pointer
    const touchOffset = evt.detail.isTouchEvent ? 120 : 0;
    const magnifyPosition = {
      top: Math.max(canvasLocation.y - 0.5 * magnifySize - touchOffset, 0),
      left: Math.max(canvasLocation.x - 0.5 * magnifySize, 0),
    };

    // Get full magnifier dimensions with borders
    const magnifierBox = magnifyCanvas.getBoundingClientRect();

    // Constrain magnifier to canvas boundaries
    magnifyPosition.top = Math.min(
      magnifyPosition.top,
      canvas.height - magnifierBox.height
    );
    magnifyPosition.left = Math.min(
      magnifyPosition.left,
      canvas.width - magnifierBox.width
    );
    magnifyCanvas.style.top = `${magnifyPosition.top}px`;
    magnifyCanvas.style.left = `${magnifyPosition.left}px`;
    magnifyCanvas.style.display = 'block';
  }

  /**
   * Creates a cornerstone enabled element, and renders the target image at the
   * desired magnification level using it.
   *
   * @private
   * @param {*} evt
   * @returns {void}
   */
  _drawZoomedElement(evt) {
    const element = evt.detail.element;
    let enabledElement = evt.detail.enabledElement;

    if (enabledElement === undefined) {
      enabledElement = external.cornerstone.getEnabledElement(element);
    }

    const magnificationLevel = this.configuration.magnificationLevel;
    const origCanvas = enabledElement.canvas;
    const image = enabledElement.image;

    // Create a new cornerstone enabledElement
    if (!this.zoomElement) {
      this.zoomElement = document.createElement('div');
      this.zoomElement.width = origCanvas.width * magnificationLevel;
      this.zoomElement.height = origCanvas.height * magnificationLevel;
      external.cornerstone.enable(this.zoomElement, enabledElement.options);
    }

    const zoomEnabledElement = external.cornerstone.getEnabledElement(
      this.zoomElement
    );
    const viewport = external.cornerstone.getViewport(enabledElement.element);

    this.zoomCanvas = zoomEnabledElement.canvas;
    this.zoomCanvas.width = origCanvas.width * magnificationLevel;
    this.zoomCanvas.height = origCanvas.height * magnificationLevel;

    zoomEnabledElement.viewport = Object.assign({}, viewport);

    // Update it's viewport to render at desired magnification level
    viewport.scale *= magnificationLevel;
    external.cornerstone.displayImage(this.zoomElement, image);
    external.cornerstone.setViewport(this.zoomElement, viewport);
    // To do enable annotation tools for zoomElement
  }

  /**
   * Removes the canvas and associated enabled element that's
   * used to render the zoomed image.
   * @returns {void}
   */
  _removeZoomElement() {
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
   * @private
   *
   * @param {*} element
   * @returns {void}
   */
  _createMagnificationCanvas(element) {
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
   * @param {*} element
   * @returns {void}
   */
  _destroyMagnificationCanvas(element) {
    const magnifyCanvas = element.querySelector('.magnifyTool');

    if (magnifyCanvas) {
      element.removeChild(magnifyCanvas);
    }
  }
}
