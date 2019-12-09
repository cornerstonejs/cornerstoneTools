import EVENTS from '../events.js';
import external from '../externalModules.js';
import triggerEvent from '../util/triggerEvent.js';

let mouseX;
let mouseY;

function keyPress(e, element) {
  if (element.clientHeight <= 0) {
    return;
  }
  const enabledElement = external.cornerstone.getEnabledElement (element);

  if (!enabledElement.image) {
    return;
  }

  const keyPressData = {
    event: window.event || e, // Old IE support
    element,
    // viewport: external.cornerstone.getViewport (element),
    image: enabledElement.image,
    // currentPoints: {
    //   page: {
    //     x: mouseX,
    //     y: mouseY,
    //   },
    //   image: external.cornerstone.pageToPixel (element, mouseX, mouseY),
    // },
    keyCode: e.keyCode,
    which: e.which,
  };

  // keyPressData.currentPoints.canvas = external.cornerstone.pixelToCanvas (
  //   element,
  //   keyPressData.currentPoints.image
  // );

  const keyPressEvents = {
    keydown: EVENTS.KEY_DOWN,
    keypress: EVENTS.KEY_PRESS,
    keyup: EVENTS.KEY_UP,
  };

  triggerEvent (element, keyPressEvents[e.type], keyPressData);
}

function mouseMove (e) {
  mouseX = e.pageX;
  mouseY = e.pageY;
}

const keyboardEvents = ['keydown', 'keypress', 'keyup'];

function enable (element) {
  keyboardEvents.forEach (eventType => {
    document.removeEventListener (eventType, e => {
      keyPress (e, element);
    });
    document.addEventListener (eventType, e => {
      keyPress (e, element);
    });
  });

  element.removeEventListener ('mousemove', mouseMove);
  element.addEventListener ('mousemove', mouseMove);
}

function disable (element) {
  keyboardEvents.forEach (eventType => {
    document.removeEventListener (eventType, keyPress);
  });

  element.removeEventListener ('mousemove', mouseMove);
}

export default {
  enable,
  disable,
};
