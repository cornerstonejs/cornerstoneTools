<<<<<<< HEAD
import keyboardTool from '../imageTools/keyboardTool.js';
=======
import scroll from '../util/scroll';
import keyboardTool from '../imageTools/keyboardTool';
>>>>>>> b55d87f70249cbcc987b7e5eeab73c830d385702

const keys = {
  UP: 38,
  DOWN: 40
};

function keyDownCallback (e, eventData) {
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
