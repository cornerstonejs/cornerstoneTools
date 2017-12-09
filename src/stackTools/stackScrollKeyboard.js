import scroll from '../util/scroll.js';
import keyboardTool from '../imageTools/keyboardTool.js';

const keys = {
  UP: 38,
  DOWN: 40
};

function keyDownCallback (e) {
  const eventData = e.detail;
  const keyCode = eventData.keyCode;

  if (keyCode !== keys.UP && keyCode !== keys.DOWN) {
    return;
  }

  let images = 1;

  if (keyCode === keys.DOWN) {
    images = -1;
  }

  scroll(eventData.element, images);
}

// Module/private exports
const stackScrollKeyboard = keyboardTool(keyDownCallback);

export default stackScrollKeyboard;
