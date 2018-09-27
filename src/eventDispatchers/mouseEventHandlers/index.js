import customCallbackHandler from './../shared/customCallbackHandler.js';
import mouseDown from './mouseDown.js';
import mouseDownActivate from './mouseDownActivate.js';
import mouseDrag from './mouseDrag.js';
import mouseMove from './mouseMove.js';
import mouseWheel from './mouseWheel.js';

const mouseClick = customCallbackHandler.bind(
  null,
  'mouse',
  'mouseClickCallback'
);

const mouseDoubleClick = customCallbackHandler.bind(
  null,
  'mouse',
  'doubleClickCallback'
);

const mouseUp = customCallbackHandler.bind(null, 'mouse', 'mouseUpCallback');

export {
  mouseClick,
  mouseDown,
  mouseDownActivate,
  mouseDoubleClick,
  mouseDrag,
  mouseMove,
  mouseUp,
  mouseWheel
};
