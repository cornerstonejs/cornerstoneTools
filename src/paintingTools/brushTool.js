import EVENTS from '../events.js';
import external from '../externalModules.js';
import { getToolState, addToolState } from '../stateManagement/toolState.js';
import mouseButtonTool from '../imageTools/mouseButtonTool.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';
import { setToolOptions, getToolOptions } from '../toolOptions.js';
import {brush} from "./brush";

const TOOL_STATE_TOOL_TYPE = 'brush';

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
    const { cornerstone } = external;

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

    const configuration = brushTool.getConfiguration();
    const colormapId = configuration.colormapId;
    const colormap = cornerstone.colors.getColormap(colormapId);
    const colorLut = colormap.createLookupTable();

    const imageData = new ImageData(eventData.image.width, eventData.image.height);
    const image = {
      stats: {},
      minPixelValue: 0,
      getPixelData: () => pixelData,
    };

    cornerstone.storedPixelDataToCanvasImageDataColorLUT(image, colorLut.Table, imageData.data);

    window.createImageBitmap(imageData).then((imageBitmap) => {
      const canvasTopLeft = cornerstone.pixelToCanvas(eventData.element, {x: 0, y: 0});
      const canvasBottomRight = cornerstone.pixelToCanvas(eventData.element, {x: eventData.image.width, y: eventData.image.height});
      const canvasWidth = canvasBottomRight.x - canvasTopLeft.x;
      const canvasHeight = canvasBottomRight.y - canvasTopLeft.y;

      eventData.canvasContext.imageSmoothingEnabled = false;
      eventData.canvasContext.drawImage(imageBitmap, canvasTopLeft.x, canvasTopLeft.y, canvasWidth, canvasHeight);

      // Call the hover event for the brush
      brushToolInterface.onImageRendered(e);
    });
  }

  function activate (element, mouseButtonMask) {
    const { cornerstone } = external;

    setToolOptions(toolType, element, { mouseButtonMask });

    element.removeEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);
    element.addEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);

    element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownActivateCallback);
    element.addEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownActivateCallback);

    element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);
    element.addEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);

    const enabledElement = cornerstone.getEnabledElement(element);
    const { width, height } = enabledElement.image;
    const pixelData = new Uint8ClampedArray(width * height);

    const configuration = brushTool.getConfiguration();
    let colormapId = configuration.colormapId;

    if (!colormapId) {
      colormapId = 'BrushColorMap';

      const colormap = cornerstone.colors.getColormap(colormapId);

      colormap.setNumberOfColors(2);
      colormap.setColor(0, [0, 0, 0, 0]);
      colormap.setColor(1, [255, 0, 0, 255]);

      configuration.colormapId = colormapId;
    }

    addToolState(element, TOOL_STATE_TOOL_TYPE, { pixelData });

    brushTool.setConfiguration(configuration);
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
