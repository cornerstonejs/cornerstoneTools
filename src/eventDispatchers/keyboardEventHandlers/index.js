import customCallbackHandler from './../shared/customCallbackHandler.js';

const keyDown = customCallbackHandler.bind (
  null,
  'Keyboard',
  'keyboardCallBack'
);

export {keyDown};
