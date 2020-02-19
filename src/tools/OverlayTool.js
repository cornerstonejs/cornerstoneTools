import external from '../externalModules.js';
import BaseTool from './base/BaseTool.js';

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
    const { enabledElement, image, viewport, canvasContext } = eventData;

    if (!eventData || !enabledElement || !image) {
      return;
    }

    const overlayPlaneMetadata = external.cornerstone.metaData.get(
      'overlayPlaneModule',
      image.imageId
    );

    if (
      !overlayPlaneMetadata ||
      !overlayPlaneMetadata.overlays ||
      !overlayPlaneMetadata.overlays.length
    ) {
      return;
    }

    const viewportPixelSpacing = {
      column: viewport.displayedArea.columnPixelSpacing || 1,
      row: viewport.displayedArea.rowPixelSpacing || 1,
    };
    const imageWidth =
      Math.abs(viewport.displayedArea.brhc.x - viewport.displayedArea.tlhc.x) *
      viewportPixelSpacing.column;
    const imageHeight =
      Math.abs(viewport.displayedArea.brhc.y - viewport.displayedArea.tlhc.y) *
      viewportPixelSpacing.row;

    overlayPlaneMetadata.overlays.forEach(overlay => {
      if (overlay.visible === false) {
        return;
      }

      const layerCanvas = document.createElement('canvas');

      layerCanvas.width = imageWidth;
      layerCanvas.height = imageHeight;

      const layerContext = layerCanvas.getContext('2d');

      layerContext.fillStyle = overlay.fillStyle || 'white';

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

      // Guard against non-number values
      const overlayX =
        !isNaN(parseFloat(overlay.x)) && isFinite(overlay.x) ? overlay.x : 0;
      const overlayY =
        !isNaN(parseFloat(overlay.y)) && isFinite(overlay.y) ? overlay.y : 0;
      // Draw the overlay layer onto the canvas

      canvasContext.drawImage(layerCanvas, overlayX, overlayY);
    });
  }
}
