import external from './../externalModules.js';
import BaseTool from './../base/BaseTool.js';
import svgCursors from './../assets/svgCursors.js';

export default class PanTool extends BaseTool {
  constructor (name = 'Pan') {
    super({
      name,
      supportedInteractionTypes: ['Mouse', 'Touch']
    });

    this.svgCursor = svgCursors.pan;

    // Touch
    this.touchDragCallback = this._dragCallback.bind(this);
    // Mouse
    this.mouseDragCallback = this._dragCallback.bind(this);
  }

  _dragCallback (evt) {
    const eventData = evt.detail;
    const { element, viewport } = eventData;

    const translation = this._getTranslation(eventData);

    this._applyTranslation(viewport, translation);
    external.cornerstone.setViewport(element, viewport);
  }

  _getTranslation (eventData) {
    const { viewport, image, deltaPoints } = eventData;

    let widthScale = viewport.scale;
    let heightScale = viewport.scale;

    if (image.rowPixelSpacing < image.columnPixelSpacing) {
      widthScale *= (image.columnPixelSpacing / image.rowPixelSpacing);
    } else if (image.columnPixelSpacing < image.rowPixelSpacing) {
      heightScale *= (image.rowPixelSpacing / image.columnPixelSpacing);
    }

    return {
      x: (deltaPoints.page.x / widthScale),
      y: (deltaPoints.page.y / heightScale)
    };
  }

  _applyTranslation (viewport, translation) {
    viewport.translation.x += translation.x;
    viewport.translation.y += translation.y;
  }
}
