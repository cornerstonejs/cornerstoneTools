import touchDragTool from '../imageTools/touchDragTool';
import multiTouchDragTool from '../imageTools/multiTouchDragTool';
import simpleMouseButtonTool from '../imageTools/simpleMouseButtonTool';
import mouseWheelTool from '../imageTools/mouseWheelTool';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled';
import scroll from '../util/scroll';
import { getToolState } from '../stateManagement/toolState';

function mouseUpCallback (e, eventData) {
  $(eventData.element).off('CornerstoneToolsMouseDrag', dragCallback);
  $(eventData.element).off('CornerstoneToolsMouseUp', mouseUpCallback);
  $(eventData.element).off('CornerstoneToolsMouseClick', mouseUpCallback);
}

function mouseDownCallback (e, eventData) {
  if (isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
    const mouseDragEventData = {
      deltaY: 0
    };

    $(eventData.element).on('CornerstoneToolsMouseDrag', mouseDragEventData, dragCallback);
    $(eventData.element).on('CornerstoneToolsMouseUp', mouseUpCallback);
    $(eventData.element).on('CornerstoneToolsMouseClick', mouseUpCallback);
    e.stopImmediatePropagation();

    return false;
  }
}

function mouseWheelCallback (e, eventData) {
  const images = -eventData.direction;

  scroll(eventData.element, images);
}

function dragCallback (e, eventData) {
  const element = eventData.element;

  const toolData = getToolState(element, 'stack');

  if (!toolData || !toolData.data || !toolData.data.length) {
    return;
  }

  const stackData = toolData.data[0];

  const config = stackScroll.getConfiguration();

    // The Math.max here makes it easier to mouseDrag-scroll small image stacks
  let pixelsPerImage = $(element).height() / Math.max(stackData.imageIds.length, 8);

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
