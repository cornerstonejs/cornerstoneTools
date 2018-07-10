import EVENTS from '../events.js';
import external from '../externalModules.js';
import { getToolState, addToolState } from '../stateManagement/toolState.js';
import mouseButtonTool from '../imageTools/mouseButtonTool.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';
import { setToolOptions, getToolOptions } from '../toolOptions.js';
import clip from '../util/clip.js';

const TOOL_STATE_TOOL_TYPE = 'brush';
let brushLayerId;
let imageLayerId;

export default function brushTool (brushToolInterface) {
  const toolType = brushToolInterface.toolType;

  function keyDownCallback (e) {
    const eventData = e.detail;
    let imageNeedsUpdate = false;

    imageNeedsUpdate = keyDownChangeToolSize(eventData) || imageNeedsUpdate;
    imageNeedsUpdate = keyDownChangeSegmentation(eventData) || imageNeedsUpdate;

    if (imageNeedsUpdate) {
      // Force onImageRendered to fire
      external.cornerstone.updateImage(eventData.element);
    }
  }

  function keyDownChangeToolSize (eventData) {
    const keyCode = eventData.keyCode;
    let imageNeedsUpdate = false;

    if (keyCode === 109 || keyCode === 173) {
      decreaseRadius();
      imageNeedsUpdate = true;
    } else if (keyCode === 61 || keyCode === 107) {
      increaseRadius();
      imageNeedsUpdate = true;
    }

    return imageNeedsUpdate;
  }

  function keyDownChangeSegmentation (eventData) {
    const keyCode = eventData.keyCode;
    let imageNeedsUpdate = false;

    if (keyCode === 219) {
      previousSegmentation();
      imageNeedsUpdate = true;
    } else if (keyCode === 221) {
      nextSegmentation();
      imageNeedsUpdate = true;
    }

    return imageNeedsUpdate;
  }

  function changeDrawColor (drawId) {
    const configuration = brushTool.getConfiguration();
    const colormap = external.cornerstone.colors.getColormap(configuration.colormapId);

    configuration.draw = drawId;
    const colorArray = colormap.getColor(configuration.draw);

    configuration.hoverColor = `rgba(${colorArray[[0]]}, ${colorArray[[1]]}, ${colorArray[[2]]}, 1.0 )`;
    configuration.dragColor = `rgba(${colorArray[[0]]}, ${colorArray[[1]]}, ${colorArray[[2]]}, 0.8 )`;
  }

  function increaseRadius () {
    const configuration = brushTool.getConfiguration();

    configuration.radius = clip(configuration.radius + 1, configuration.minRadius, configuration.maxRadius);
  }

  function decreaseRadius () {
    const configuration = brushTool.getConfiguration();

    configuration.radius = clip(configuration.radius - 1, configuration.minRadius, configuration.maxRadius);
  }

  function nextSegmentation () {
    const configuration = brushTool.getConfiguration();
    const numberOfColors = getNumberOfColors();

    let drawId = configuration.draw + 1;

    if (drawId === numberOfColors) {
      drawId = 0;
    }

    changeDrawColor(drawId);
  }

  function previousSegmentation () {
    const configuration = brushTool.getConfiguration();
    const numberOfColors = getNumberOfColors();

    let drawId = configuration.draw - 1;

    if (drawId < 0) {
      drawId = numberOfColors - 1;
    }

    changeDrawColor(drawId);
  }

  function getNumberOfColors () {
    const configuration = brushTool.getConfiguration();
    const colormap = external.cornerstone.colors.getColormap(configuration.colormapId);

    return colormap.getNumberOfColors();
  }

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

  function setBrushColormap (colormapId) {
    const colormap = external.cornerstone.colors.getColormap(colormapId);

    colormap.setNumberOfColors(20);
    colormap.setColor(0, [255, 255, 255, 0]);
    colormap.setColor(1, [230, 25, 75, 102]);
    colormap.setColor(2, [60, 180, 175, 102]);
    colormap.setColor(3, [255, 225, 25, 102]);
    colormap.setColor(4, [0, 130, 200, 102]);
    colormap.setColor(5, [245, 130, 48, 102]);
    colormap.setColor(6, [145, 30, 180, 102]);
    colormap.setColor(7, [70, 240, 240, 102]);
    colormap.setColor(8, [240, 50, 230, 102]);
    colormap.setColor(9, [210, 245, 60, 102]);
    colormap.setColor(10, [250, 190, 190, 102]);
    colormap.setColor(11, [0, 128, 128, 102]);
    colormap.setColor(12, [230, 190, 255, 102]);
    colormap.setColor(13, [170, 110, 40, 102]);
    colormap.setColor(14, [255, 250, 200, 102]);
    colormap.setColor(15, [128, 0, 0, 102]);
    colormap.setColor(16, [170, 255, 195, 102]);
    colormap.setColor(17, [128, 128, 0, 102]);
    colormap.setColor(18, [255, 215, 180, 102]);
    colormap.setColor(19, [0, 0, 128, 102]);
  }

  function activate (element, mouseButtonMask) {
    setToolOptions(toolType, element, { mouseButtonMask });

    element.removeEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);
    element.addEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);

    element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownActivateCallback);
    element.addEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownActivateCallback);

    element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);
    element.addEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);

    element.removeEventListener(EVENTS.KEY_DOWN, keyDownCallback);
    element.addEventListener(EVENTS.KEY_DOWN, keyDownCallback);

    const enabledElement = external.cornerstone.getEnabledElement(element);
    const { width, height } = enabledElement.image;
    let pixelData = new Uint8ClampedArray(width * height);

    const configuration = brushTool.getConfiguration();

    configuration.active = true;
    let colormapId = configuration.colormapId;

    if (!colormapId) {
      const configuration = brushTool.getConfiguration();

      colormapId = 'BrushColorMap';
      setBrushColormap(colormapId);
      configuration.colormapId = colormapId;
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

    // Add imageLayer if it doesn't exist.
    if (!imageLayerId) {
      imageLayerId = external.cornerstone.addLayer(element, external.cornerstone.getEnabledElement(element).image);
    }

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
    element.removeEventListener(EVENTS.KEY_DOWN, keyDownCallback);

    element.addEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);

    const configuration = brushTool.getConfiguration();

    configuration.active = false;
  }

  const brushTool = mouseButtonTool({
    mouseMoveCallback,
    mouseDownActivateCallback,
    onImageRendered,
    deactivate
  });

  brushTool.keyDownCallback = keyDownCallback;
  brushTool.activate = activate;
  brushTool.changeDrawColor = changeDrawColor;
  brushTool.increaseRadius = increaseRadius;
  brushTool.decreaseRadius = decreaseRadius;
  brushTool.nextSegmentation = nextSegmentation;
  brushTool.previousSegmentation = previousSegmentation;

  return brushTool;
}
