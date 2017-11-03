import { external } from '../externalModules.js';
import touchDragTool from '../imageTools/touchDragTool.js';
import multiTouchDragTool from '../imageTools/multiTouchDragTool.js';
import simpleMouseButtonTool from '../imageTools/simpleMouseButtonTool.js';
import mouseWheelTool from '../imageTools/mouseWheelTool.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';
import scroll from '../util/scroll.js';
import { getToolState } from '../stateManagement/toolState.js';

function mouseUpCallback (e, eventData) {
  external.$(eventData.element).off('CornerstoneToolsMouseDrag', dragCallback);
  external.$(eventData.element).off('CornerstoneToolsMouseUp', mouseUpCallback);
  external.$(eventData.element).off('CornerstoneToolsMouseClick', mouseUpCallback);
}

function mouseDownCallback (e, eventData) {
  if (isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
    const mouseDragEventData = {
      deltaY: 0
    };

    external.$(eventData.element).on('CornerstoneToolsMouseDrag', mouseDragEventData, dragCallback);
    external.$(eventData.element).on('CornerstoneToolsMouseUp', mouseUpCallback);
    external.$(eventData.element).on('CornerstoneToolsMouseClick', mouseUpCallback);
    e.stopImmediatePropagation();

    return false;
  }
}

function mouseWheelCallback (e, eventData) {
  const images = -eventData.direction;

  const config = stackScroll.getConfiguration();

  let loop = false;

  if (config && config.loop) {
    loop = config.loop;
  }

  scroll(eventData.element, images, loop);
}

function dragCallback (e, eventData) {
  const element = eventData.element;

  const toolData = getToolState(element, 'stack');

  if (!toolData || !toolData.data || !toolData.data.length) {
    return;
  }

  const stackData = toolData.data[0];

  const config = stackScroll.getConfiguration();

  // The Math.max here makes it easier to mouseDrag-scroll small or really large image stacks
  let pixelsPerImage = Math.max(2, external.$(element).height() / Math.max(stackData.imageIds.length, 8));

  if (config && config.stackScrollSpeed) {
    pixelsPerImage = config.stackScrollSpeed;
  }

  e.data.deltaY = e.data.deltaY || 0;
  e.data.deltaY += eventData.deltaPoints.page.y;
  if (Math.abs(e.data.deltaY) >= pixelsPerImage) {
    const imageDelta = e.data.deltaY / pixelsPerImage;
    const imageIdIndexOffset = Math.round(imageDelta);
    const imageDeltaMod = e.data.deltaY % pixelsPerImage;

    e.data.deltaY = imageDeltaMod;
    scroll(element, imageIdIndexOffset);
  }

  return false; // False = causes jquery to preventDefault() and stopPropagation() this event
}

// Module/private exports
const stackScroll = simpleMouseButtonTool(mouseDownCallback);
const stackScrollWheel = mouseWheelTool(mouseWheelCallback);

const options = {
  eventData: {
    deltaY: 0
  }
};
const stackScrollTouchDrag = touchDragTool(dragCallback, options);

function multiTouchDragCallback (e, eventData) {
  const config = stackScrollMultiTouch.getConfiguration();

  if (config && config.testPointers(eventData)) {
    dragCallback(e, eventData);
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
