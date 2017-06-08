import * as cornerstone from 'cornerstone-core';

function mouseWheel (e) {
    // !!!HACK/NOTE/WARNING!!!
    // For some reason I am getting mousewheel and DOMMouseScroll events on my
    // Mac os x mavericks system when middle mouse button dragging.
    // I couldn't find any info about this so this might break other systems
    // Webkit hack
  if (e.originalEvent.type === 'mousewheel' && e.originalEvent.wheelDeltaY === 0) {
    return;
  }
    // Firefox hack
  if (e.originalEvent.type === 'DOMMouseScroll' && e.originalEvent.axis === 1) {
    return;
  }

  e.preventDefault();

  const element = e.currentTarget;

  let x;
  let y;

  if (e.pageX !== undefined && e.pageY !== undefined) {
    x = e.pageX;
    y = e.pageY;
  } else if (e.originalEvent &&
               e.originalEvent.pageX !== undefined &&
               e.originalEvent.pageY !== undefined) {
    x = e.originalEvent.pageX;
    y = e.originalEvent.pageY;
  } else {
        // IE9 & IE10
    x = e.x;
    y = e.y;
  }

  const startingCoords = cornerstone.pageToPixel(element, x, y);

  e = window.event || e; // Old IE support

  let wheelDelta;

  if (e.originalEvent && e.originalEvent.wheelDelta) {
    wheelDelta = -e.originalEvent.wheelDelta;
  } else if (e.originalEvent && e.originalEvent.deltaY) {
    wheelDelta = -e.originalEvent.deltaY;
  } else if (e.originalEvent && e.originalEvent.detail) {
    wheelDelta = -e.originalEvent.detail;
  } else {
    wheelDelta = e.wheelDelta;
  }

  const direction = wheelDelta < 0 ? -1 : 1;

  const mouseWheelData = {
    element,
    viewport: cornerstone.getViewport(element),
    image: cornerstone.getEnabledElement(element).image,
    direction,
    pageX: x,
    pageY: y,
    imageX: startingCoords.x,
    imageY: startingCoords.y
  };

  $(element).trigger('CornerstoneToolsMouseWheel', mouseWheelData);
}

const mouseWheelEvents = 'mousewheel DOMMouseScroll';

function enable (element) {
    // Prevent handlers from being attached multiple times
  disable(element);

  $(element).on(mouseWheelEvents, mouseWheel);
}

function disable (element) {
  $(element).unbind(mouseWheelEvents, mouseWheel);
}

// Module exports
const mouseWheelInput = {
  enable,
  disable
};

export default mouseWheelInput;
