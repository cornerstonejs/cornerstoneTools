import EVENTS from '../events.js';
import touchDragTool from '../imageTools/touchDragTool.js';
import multiTouchDragTool from '../imageTools/multiTouchDragTool.js';
import simpleMouseButtonTool from '../imageTools/simpleMouseButtonTool.js';
import mouseWheelTool from '../imageTools/mouseWheelTool.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';
import scroll from '../util/scroll.js';
import { getToolState } from '../stateManagement/toolState.js';
import { setToolOptions, getToolOptions } from '../toolOptions.js';

const toolType = 'stackScroll';
const toolTypeTouchDrag = 'stackScrollTouchDrag';

function mouseUpCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;

  element.removeEventListener(EVENTS.MOUSE_DRAG, dragCallback);
  element.removeEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
  element.removeEventListener(EVENTS.MOUSE_CLICK, mouseUpCallback);
}

function mouseDownCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;
  const options = getToolOptions(toolType, element);

  if (isMouseButtonEnabled(eventData.which, options.mouseButtonMask)) {
    options.deltaY = 0;

    setToolOptions(toolType, element, options);

    element.addEventListener(EVENTS.MOUSE_DRAG, dragCallback);
    element.addEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
    element.addEventListener(EVENTS.MOUSE_CLICK, mouseUpCallback);
    e.stopImmediatePropagation();

    return false;
  }
}

function mouseWheelCallback (e) {
  const eventData = e.detail;
  const images = -eventData.direction;

  const config = stackScroll.getConfiguration();

  let loop = false;
  let allowSkipping = true;

  if (config) {
    loop = config.loop === undefined ? false : config.loop;
    allowSkipping = config.allowSkipping === undefined ? true : config.allowSkipping;
  }

  scroll(eventData.element, images, loop, allowSkipping);
}

function dragCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;

  const toolData = getToolState(element, 'stack');

  if (!toolData || !toolData.data || !toolData.data.length) {
    return;
  }

  const stackData = toolData.data[0];

  const config = stackScroll.getConfiguration();

  let allowSkipping = true;

  if (config && config.allowSkipping !== undefined) {
    allowSkipping = config.allowSkipping;
  }

  // The Math.max here makes it easier to mouseDrag-scroll small or really large image stacks
  let pixelsPerImage = Math.max(2, element.offsetHeight / Math.max(stackData.imageIds.length, 8));

  if (config && config.stackScrollSpeed) {
    pixelsPerImage = config.stackScrollSpeed;
  }

  const options = getToolOptions(toolType, element);
  let deltaY = options.deltaY || 0;

  deltaY += eventData.deltaPoints.page.y;

  if (Math.abs(deltaY) >= pixelsPerImage) {
    const imageIdIndexOffset = Math.round(deltaY / pixelsPerImage);

    scroll(element, imageIdIndexOffset, false, allowSkipping);

    options.deltaY = deltaY % pixelsPerImage;
  } else {
    options.deltaY = deltaY;
  }

  setToolOptions(toolType, element, options);

  e.preventDefault();
  e.stopPropagation();
}

// Module/private exports
const stackScroll = simpleMouseButtonTool(mouseDownCallback, toolType);
const stackScrollWheel = mouseWheelTool(mouseWheelCallback);

const options = {
  eventData: {
    deltaY: 0
  }
};
const stackScrollTouchDrag = touchDragTool(dragCallback, toolTypeTouchDrag, options);

function multiTouchDragCallback (e) {
  const eventData = e.detail;
  const config = stackScrollMultiTouch.getConfiguration();

  if (config && config.testPointers(eventData)) {
    dragCallback(e);
  }
}

const configuration = {
  testPointers (eventData) {
    return (eventData.numPointers >= 3);
  }
};

const stackScrollMultiTouch = multiTouchDragTool(multiTouchDragCallback, options);

stackScrollMultiTouch.setConfiguration(configuration);

export {
  stackScroll,
  stackScrollWheel,
  stackScrollTouchDrag,
  stackScrollMultiTouch
};
