/* eslint no-underscore-dangle: 0 */
/* eslint class-methods-use-this: 0 */
import external from '../externalModules.js';
import BaseTool from '../base/BaseTool.js';

export default class PanMultiTouchTool extends BaseTool {
  constructor (name = 'PanMultiTouch') {
    super({
      name,
      supportedInteractionTypes: ['MultiTouch'],
      configuration: {
        touchPointers: 2
      }
    });

    // Touch
    this.multiTouchDragCallback = this._dragCallback.bind(this);
  }

  _dragCallback (evt) {
    const eventData = evt.detail;
    const { element, viewport } = eventData;

    if (eventData.numPointers === this.configuration.touchPointers) {
      const translation = this._getTranslation(eventData);

      this._applyTranslation(viewport, translation);
      external.cornerstone.setViewport(element, viewport);
    }
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
