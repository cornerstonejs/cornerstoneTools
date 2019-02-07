import external from '../externalModules.js';
import BaseTool from './base/BaseTool.js';
// Drawing
import { getNewContext } from '../drawing/index.js';

/**
 *
 * http://dicom.nema.org/dicom/2013/output/chtml/part03/sect_C.9.html
 *
 * @public
 * @class Overlay
 * @memberof Tools
 *
 * @classdesc Tool for displaying a scale overlay on the image.
 * @extends Tools.Base.BaseTool
 */
export default class OverlayTool extends BaseTool {
  constructor(configuration = {}) {
    const defaultConfig = {
      name: 'Overlay',
      configuration: {},
      mixins: ['enabledOrDisabledBinaryTool'],
    };
    const initialConfiguration = Object.assign(defaultConfig, configuration);

    super(initialConfiguration);

    this.initialConfiguration = initialConfiguration;
  }

  enabledCallback(element) {
    this.forceImageUpdate(element);
  }

  disabledCallback(element) {
    this.forceImageUpdate(element);
  }

  forceImageUpdate(element) {
    const enabledElement = external.cornerstone.getEnabledElement(element);

    if (enabledElement.image) {
      external.cornerstone.updateImage(element);
    }
  }

  renderToolData(evt) {
    const eventData = evt.detail;

    if (
      !eventData ||
      !eventData.enabledElement ||
      !eventData.image ||
      !eventData.image.overlays ||
      !eventData.image.overlays.length === 0
    ) {
      return;
    }

    const context = getNewContext(eventData.canvasContext.canvas);
    const overlays = eventData.image.overlays;
    const { image, viewport, element } = eventData;

    const imageWidth =
      Math.abs(viewport.displayedArea.brhc.x - viewport.displayedArea.tlhc.x) *
      viewport.displayedArea.columnPixelSpacing;
    const imageHeight =
      Math.abs(viewport.displayedArea.brhc.y - viewport.displayedArea.tlhc.y) *
      viewport.displayedArea.rowPixelSpacing;

    context.save();

    overlays.forEach(overlay => {
      if (!overlay.visible) {
        return;
      }
      const layerCanvas = document.createElement('canvas');

      layerCanvas.width = imageWidth;
      layerCanvas.height = imageHeight;
      const layerContext = layerCanvas.getContext('2d');
      const transform = external.cornerstone.internal.getTransform(
        enabledElement
      );

      layerContext.setTransform(
        transform.m[0],
        transform.m[1],
        transform.m[2],
        transform.m[3],
        transform.m[4],
        transform.m[5]
      );
      layerContext.save();
      layerContext.setTransform(1, 0, 0, 1, 0, 0);
      layerContext.fillStyle = overlay.fillStyle;

      if (overlay.type === 'R') {
        layerContext.fillRect(0, 0, layerCanvas.width, layerCanvas.height);
        layerContext.globalCompositeOperation = 'xor';
      }

      let i = 0;

      for (let y = 0; y < overlay.rows; y++) {
        for (let x = 0; x < overlay.columns; x++) {
          if (overlay.pixelData[i++] > 0) {
            layerContext.fillRect(x, y, 1, 1);
          }
        }
      }
      layerContext.restore();
      context.drawImage(layerCanvas, 0, 0);
    });

    context.restore();
  }
}
