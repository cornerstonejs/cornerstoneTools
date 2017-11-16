import { external } from '../externalModules.js';
import { getToolState, addToolState } from '../stateManagement/toolState.js';
import mouseButtonTool from '../imageTools/mouseButtonTool.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';

const TOOL_STATE_TOOL_TYPE = 'brush';
let brushLayerId;

export default function (brushToolInterface) {
  function mouseMoveCallback (e, eventData) {
    brushToolInterface.onMouseMove(e, eventData);
  }

  function mouseUpCallback (e, eventData) {
    brushToolInterface.onMouseUp(e, eventData);

    external.$(eventData.element).off('CornerstoneToolsMouseDrag', mouseMoveCallback);
    external.$(eventData.element).off('CornerstoneToolsMouseDrag', dragCallback);
    external.$(eventData.element).off('CornerstoneToolsMouseUp', mouseUpCallback);
    external.$(eventData.element).off('CornerstoneToolsMouseClick', mouseUpCallback);
  }

  function dragCallback (e, eventData) {
    brushToolInterface.onDrag(e, eventData);

    return false;
  }

  function mouseDownActivateCallback (e, eventData) {
    if (isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
      external.$(eventData.element).on('CornerstoneToolsMouseDrag', dragCallback);
      external.$(eventData.element).on('CornerstoneToolsMouseUp', mouseUpCallback);
      external.$(eventData.element).on('CornerstoneToolsMouseClick', mouseUpCallback);
      brushToolInterface.onMouseDown(e, eventData);

      return false;
    }

    external.$(eventData.element).on('CornerstoneToolsMouseDrag', mouseMoveCallback);
    external.$(eventData.element).on('CornerstoneToolsMouseUp', mouseUpCallback);
  }

  function onImageRendered (e) {
    const eventData = e.detail;
    const element = eventData.element;
    const toolData = getToolState(element, TOOL_STATE_TOOL_TYPE);
    let pixelData;

    if (toolData) {
      pixelData = toolData.data[0].pixelData;
    } else {
      pixelData = new Uint8ClampedArray(eventData.image.width * eventData.image.height);
      addToolState(element, TOOL_STATE_TOOL_TYPE, { pixelData });
    }

    const layer = external.cornerstone.getLayer(eventData.element, brushLayerId);

    layer.image.setPixelData(pixelData);
    layer.invalid = true;

    external.cornerstone.updateImage(element);

    // Note: This is to maintain compatibility with jQuery event handlers.
    // On our next migration this should just be onImageRendered(e)
    brushToolInterface.onImageRendered(e, eventData);
  }

  function activate (element, mouseButtonMask) {
    element.removeEventListener('cornerstoneimagerendered', onImageRendered);
    element.addEventListener('cornerstoneimagerendered', onImageRendered);

    const eventData = {
      mouseButtonMask
    };

    external.$(element).off('CornerstoneToolsMouseDownActivate', mouseDownActivateCallback);
    external.$(element).on('CornerstoneToolsMouseDownActivate', eventData, mouseDownActivateCallback);

    external.$(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
    external.$(element).on('CornerstoneToolsMouseMove', mouseMoveCallback);

    const enabledElement = external.cornerstone.getEnabledElement(element);
    const { width, height } = enabledElement.image;
    let pixelData = new Uint8ClampedArray(width * height);

    const configuration = brushTool.getConfiguration();
    let colormapId = configuration.colormapId;

    if (!colormapId) {
      colormapId = 'BrushColorMap';

      const colormap = external.cornerstone.colors.getColormap(colormapId);

      colormap.setNumberOfColors(2);
      colormap.setColor(0, [0, 0, 0, 0]);
      colormap.setColor(1, [255, 0, 0, 255]);
    }

    const labelMapImage = {
      minPixelValue: 0,
      maxPixelValue: 1,
      slope: 1.0,
      intercept: 0,
      getPixelData: () => pixelData,
      rows: enabledElement.image.height,
      columns: enabledElement.image.width,
      height,
      width,
      pixelData,
      setPixelData: (data) => {
        pixelData = data;
      },
      colormap: colormapId,
      color: false,
      rgba: false,
      labelmap: true,
      invert: false,
      columnPixelSpacing: 1.0,
      rowPixelSpacing: 1.0,
      sizeInBytes: enabledElement.image.width * enabledElement.image.height
    };

    let layer;
    const options = {
      viewport: {
        pixelReplication: true
      }
    };

    if (brushLayerId) {
      layer = external.cornerstone.getLayer(element, brushLayerId);
    }

    if (!layer) {
      brushLayerId = external.cornerstone.addLayer(element, labelMapImage, options);
    }

    addToolState(element, TOOL_STATE_TOOL_TYPE, { pixelData });

    configuration.brushLayerId = brushLayerId;
    brushTool.setConfiguration(configuration);

    external.cornerstone.updateImage(element);
  }

  function deactivate (element) {
    element.removeEventListener('cornerstoneimagerendered', onImageRendered);
    external.$(element).off('CornerstoneToolsMouseDownActivate', mouseDownActivateCallback);
    external.$(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
  }

  const brushTool = mouseButtonTool({
    mouseMoveCallback,
    mouseDownActivateCallback,
    onImageRendered,
    deactivate
  });

  brushTool.activate = activate;

  return brushTool;
}
