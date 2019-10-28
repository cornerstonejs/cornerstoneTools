import external from './../../../../externalModules.js';
import { state } from '../../../../store/index.js';
import EVENTS from './../../../../events.js';
import setHandlesPosition from './setHandlesPosition.js';
import getActiveTool from '../../../../util/getActiveTool';
import BaseAnnotationTool from '../../../base/BaseAnnotationTool';
import { MagnifyTool } from '../../../index.js';

const touchEndEvents = [
  EVENTS.TOUCH_END,
  EVENTS.TOUCH_DRAG_END,
  EVENTS.TOUCH_PINCH,
  EVENTS.TOUCH_PRESS,
  EVENTS.TAP,
];

function waitForImageRendered(element, callback) {
  const { IMAGE_RENDERED } = external.cornerstone.EVENTS;
  const renderedCallback = () => {
    element.removeEventListener(IMAGE_RENDERED, renderedCallback);

    callback();
  };

  element.addEventListener(IMAGE_RENDERED, renderedCallback);
}

export default function(
  mouseEventData,
  toolType,
  data,
  handle,
  doneMovingCallback,
  preventHandleOutsideImage
) {
  const { IMAGE_RENDERED } = external.cornerstone.EVENTS;
  const { element, image, buttons } = mouseEventData;
  const isTextBoxHandle = handle === data.handles.textBox;
  const config = this.configuration || {};
  const magnifySize = config.touchMagnifySize || 0;

  if (magnifySize) {
    const magnificationLevel = config.touchMagnificationLevel || 2;
    const magnify = new MagnifyTool({
      configuration: {
        magnifySize,
        magnificationLevel,
      },
    });

    this.magnify = magnify;
  }

  const distanceFromTool = {
    x: handle.x - mouseEventData.currentPoints.image.x,
    y: handle.y - mouseEventData.currentPoints.image.y,
  };

  const touchDragCallback = event => {
    const eventData = event.detail;

    handle.hasMoved = true;

    if (handle.index === undefined || handle.index === null) {
      handle.x = eventData.currentPoints.image.x + distanceFromTool.x;
      handle.y = eventData.currentPoints.image.y + distanceFromTool.y;
    } else {
      setHandlesPosition(handle, eventData, data, distanceFromTool);
    }

    if (preventHandleOutsideImage) {
      handle.x = Math.max(handle.x, 0);
      handle.x = Math.min(handle.x, eventData.image.width);

      handle.y = Math.max(handle.y, 0);
      handle.y = Math.min(handle.y, eventData.image.height);
    }

    data.invalidated = true;

    waitForImageRendered(element, () => {
      if (!state.isToolLocked || isTextBoxHandle) {
        return;
      }

      if (this.magnify) {
        if (!this.magnify.zoomElement) {
          this.magnify._drawZoomedElement(event);
        }

        this.magnify._drawMagnificationTool(event);
        external.cornerstone.updateImage(this.magnify.zoomElement);
      }
    });

    external.cornerstone.updateImage(element);

    const activeTool = getActiveTool(element, buttons, 'touch');

    if (activeTool instanceof BaseAnnotationTool) {
      activeTool.updateCachedStats(image, element, data);
    }

    const modifiedEventData = {
      toolType,
      element,
      measurementData: data,
    };

    external.cornerstone.triggerEvent(
      element,
      EVENTS.MEASUREMENT_MODIFIED,
      modifiedEventData
    );
  };

  handle.active = true;
  state.isToolLocked = true;

  element.addEventListener(EVENTS.TOUCH_DRAG, touchDragCallback);

  const currentImage = external.cornerstone.getImage(element);
  const imageRenderedHandler = () => {
    const newImage = external.cornerstone.getImage(element);

    // Check if the rendered image changed during measurement modifying and stop it if so
    if (newImage.imageId !== currentImage.imageId) {
      touchEndCallback();
    }
  };

  // Bind the event listener for image rendering
  element.addEventListener(IMAGE_RENDERED, imageRenderedHandler);

  const touchEndCallback = () => {
    handle.active = false;
    state.isToolLocked = false;

    element.removeEventListener(IMAGE_RENDERED, imageRenderedHandler);
    element.removeEventListener(EVENTS.TOUCH_DRAG, touchDragCallback);
    touchEndEvents.forEach(eventType => {
      element.removeEventListener(eventType, touchEndCallback);
    });

    if (this.magnify) {
      this.magnify._removeZoomElement();
      this.magnify._destroyMagnificationCanvas(element);
    }

    external.cornerstone.updateImage(element);

    if (typeof doneMovingCallback === 'function') {
      doneMovingCallback();
    }
  };

  touchEndEvents.forEach(eventType => {
    element.addEventListener(eventType, touchEndCallback);
  });
}
