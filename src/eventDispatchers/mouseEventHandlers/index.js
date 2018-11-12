import customCallbackHandler from './../shared/customCallbackHandler.js';
import mouseDown from './mouseDown.js';
import mouseDownActivate from './mouseDownActivate.js';
import mouseDrag from './mouseDrag.js';
import mouseMove from './mouseMove.js';

const mouseClick = customCallbackHandler.bind(
  null,
  'Mouse',
  'mouseClickCallback'
);

const mouseDoubleClick = customCallbackHandler.bind(
  null,
  'Mouse',
  'doubleClickCallback'
);

const mouseUp = customCallbackHandler.bind(null, 'Mouse', 'mouseUpCallback');

const mouseWheel = customCallbackHandler.bind(
  null,
  'MouseWheel',
  'mouseWheelCallback'
);

export {
  mouseClick,
  mouseDown,
  mouseDownActivate,
  mouseDoubleClick,
  mouseDrag,
  mouseMove,
  mouseUp,
  mouseWheel,
};
