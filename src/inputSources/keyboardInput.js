import { external } from '../externalModules.js';
import triggerEvent from '../util/triggerEvent.js';

let mouseX;
let mouseY;

function keyPress (e) {
  const cornerstone = external.cornerstone;
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

  triggerEvent(element, keyPressEvents[e.type], keyPressData);
}

function mouseMove (e) {
  mouseX = e.pageX || e.originalEvent.pageX;
  mouseY = e.pageY || e.originalEvent.pageY;
}

const keyboardEvent = 'keydown keypress keyup';

function enable (element) {
  // Prevent handlers from being attached multiple times
  disable(element);

  external.$(element).on(keyboardEvent, keyPress);
  external.$(element).on('mousemove', mouseMove);
}

function disable (element) {
  external.$(element).off(keyboardEvent, keyPress);
  external.$(element).off('mousemove', mouseMove);
}

// Module exports
const keyboardInput = {
  enable,
  disable
};

export default keyboardInput;
