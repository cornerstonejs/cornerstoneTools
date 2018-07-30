import customCallbackHandler from './../shared/customCallbackHandler.js';
import mouseDown from './mouseDown.js';
import mouseDownActivate from './mouseDownActivate.js';
import mouseDrag from './mouseDrag.js';
import mouseMove from './mouseMove.js';
import mouseWheel from './mouseWheel.js';
import onImageRendered from './onImageRendered.js';

const mouseDoubleClick = customCallbackHandler.bind(
  null,
  'mouse',
  'doubleClickCallback'
);

export {
  mouseDown,
  mouseDownActivate,
  mouseDoubleClick,
  mouseDrag,
  mouseMove,
  mouseWheel,
  onImageRendered
};
