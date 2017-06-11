import * as cornerstone from 'cornerstone-core';

let mouseX;
let mouseY;

function keyPress (e) {
  const element = e.currentTarget;

  const keyPressData = {
    event: window.event || e, // Old IE support
    element,
    viewport: cornerstone.getViewport(element),
    image: cornerstone.getEnabledElement(element).image,
    currentPoints: {
      page: {
        x: mouseX,
        y: mouseY
      },
      image: cornerstone.pageToPixel(element, mouseX, mouseY)
    },
    keyCode: e.keyCode,
    which: e.which
  };

  keyPressData.currentPoints.canvas = cornerstone.pixelToCanvas(element, keyPressData.currentPoints.image);

  const keyPressEvents = {
    keydown: 'CornerstoneToolsKeyDown',
    keypress: 'CornerstoneToolsKeyPress',
    keyup: 'CornerstoneToolsKeyUp'

  };

  $(element).trigger(keyPressEvents[e.type], keyPressData);
}

function mouseMove (e) {
  mouseX = e.pageX || e.originalEvent.pageX;
  mouseY = e.pageY || e.originalEvent.pageY;
}

const keyboardEvent = 'keydown keypress keyup';

function enable (element) {
    // Prevent handlers from being attached multiple times
  disable(element);

  $(element).on(keyboardEvent, keyPress);
  $(element).on('mousemove', mouseMove);
}

function disable (element) {
  $(element).off(keyboardEvent, keyPress);
  $(element).off('mousemove', mouseMove);
}

// Module exports
const keyboardInput = {
  enable,
  disable
};

export default keyboardInput;
