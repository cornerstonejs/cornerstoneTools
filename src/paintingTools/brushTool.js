import EVENTS from '../events.js';
import external from '../externalModules.js';
import { getToolState, addToolState } from '../stateManagement/toolState.js';
import mouseButtonTool from '../imageTools/mouseButtonTool.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';
import { setToolOptions, getToolOptions } from '../toolOptions.js';

const TOOL_STATE_TOOL_TYPE = 'brush';
let brushLayerId;

export default function brushTool (brushToolInterface) {
  const toolType = brushToolInterface.toolType;

  function mouseMoveCallback (e) {
    brushToolInterface.onMouseMove(e);
  }

  function mouseUpCallback (e) {
    const eventData = e.detail;
    const element = eventData.element;

    brushToolInterface.onMouseUp(e);

    element.removeEventListener(EVENTS.MOUSE_DRAG, mouseMoveCallback);
    element.removeEventListener(EVENTS.MOUSE_DRAG, dragCallback);
    element.removeEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
    element.removeEventListener(EVENTS.MOUSE_CLICK, mouseUpCallback);
  }

  function dragCallback (e) {
    brushToolInterface.onDrag(e);

    return false;
  }

  function mouseDownActivateCallback (e) {
    const eventData = e.detail;
    const element = eventData.element;
    const options = getToolOptions(toolType, element);

    if (isMouseButtonEnabled(eventData.which, options.mouseButtonMask)) {
      element.addEventListener(EVENTS.MOUSE_DRAG, dragCallback);
      element.addEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
      element.addEventListener(EVENTS.MOUSE_CLICK, mouseUpCallback);
      brushToolInterface.onMouseDown(e);

      return false;
    }

    element.addEventListener(EVENTS.MOUSE_DRAG, mouseMoveCallback);
    element.addEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
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

    brushToolInterface.onImageRendered(e);
  }

  function activate (element, mouseButtonMask) {
    setToolOptions(toolType, element, { mouseButtonMask });

    element.removeEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);
    element.addEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);

    element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownActivateCallback);
    element.addEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownActivateCallback);

    element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);
    element.addEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);

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
    element.removeEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);
    element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownActivateCallback);
    element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);
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
