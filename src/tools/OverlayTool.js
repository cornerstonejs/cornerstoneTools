import { modules } from '../store/index';
import external from '../externalModules.js';
import BaseTool from './base/BaseTool.js';

const globalConfiguration = modules.globalConfiguration;

/**
 *
 * http://dicom.nema.org/dicom/2013/output/chtml/part03/sect_C.9.html
 *
 * @public
 * @class Overlay
 * @memberof Tools
 *
 * @classdesc Tool for displaying a scale overlay on the image.  Uses viewport.overlayColor to set the default colour.
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

  setupRender(image) {
    if (!image) {
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

    return overlayPlaneMetadata;
  }

  setupViewport(viewport) {
    if (viewport.overlayColor === undefined) {
      viewport.overlayColor =
        globalConfiguration.configuration.overlayColor || 'white';
    }
    // Allow turning off overlays by setting overlayColor to false
    if (viewport.overlayColor === false) {
      return;
    }

    return true;
  }

  renderToolData(evt) {
    const eventData = evt.detail;
    const { enabledElement, image, viewport, canvasContext } = eventData;
    const overlayPlaneMetadata = this.setupRender(image);

    if (!eventData || !enabledElement || !overlayPlaneMetadata) {
      return;
    }
    if (!this.setupViewport(viewport)) {
      return;
    }

    const imageWidth = image.columns;
    const imageHeight = image.rows;

    overlayPlaneMetadata.overlays.forEach(overlay => {
      if (overlay.visible === false) {
        return;
      }

      const layerCanvas = document.createElement('canvas');

      layerCanvas.width = imageWidth;
      layerCanvas.height = imageHeight;

      const layerContext = layerCanvas.getContext('2d');

      layerContext.fillStyle = overlay.fillStyle || viewport.overlayColor;

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
