import external from '../externalModules.js';

// const toolType = 'overlays';

function onImageRendered (e) {
  const eventData = e.detail;

  if (!eventData || !eventData.enabledElement || !eventData.image || !eventData.image.overlays || !eventData.image.overlays.length === 0) {
    return;
  }

  const enabledElement = eventData.enabledElement;
  const context = enabledElement.canvas.getContext('2d');
  const overlays = eventData.image.overlays;

  const imageWidth = Math.abs(enabledElement.viewport.displayedArea.brhc.x - enabledElement.viewport.displayedArea.tlhc.x) * enabledElement.viewport.displayedArea.columnPixelSpacing;
  const imageHeight = Math.abs(enabledElement.viewport.displayedArea.brhc.y - enabledElement.viewport.displayedArea.tlhc.y) * enabledElement.viewport.displayedArea.rowPixelSpacing;

  context.save();

  overlays.forEach((overlay) => {
    if (!overlay.visible) {
      return;
    }
    const layerCanvas = document.createElement('canvas');

    layerCanvas.width = imageWidth;
    layerCanvas.height = imageHeight;
    const layerContext = layerCanvas.getContext('2d');
    const transform = external.cornerstone.internal.getTransform(enabledElement);

    layerContext.setTransform(transform.m[0], transform.m[1], transform.m[2], transform.m[3], transform.m[4], transform.m[5]);
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

// Enables the overlays tool for a given element
function enable (element) {
  element.removeEventListener(external.cornerstone.EVENTS.IMAGE_RENDERED, onImageRendered);
  element.addEventListener(external.cornerstone.EVENTS.IMAGE_RENDERED, onImageRendered);
  external.cornerstone.updateImage(element);
}

// Disables the overlays tool for the given element
function disable (element) {
  element.removeEventListener(external.cornerstone.EVENTS.IMAGE_RENDERED, onImageRendered);
  external.cornerstone.updateImage(element);
}

// Module/private exports
const tool = {
  enable,
  disable
};

export default tool;
