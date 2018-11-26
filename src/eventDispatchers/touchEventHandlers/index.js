import customCallbackHandler from './../shared/customCallbackHandler.js';
import multiTouchDrag from './multiTouchDrag.js';
import tap from './tap.js';
import touchStart from './touchStart.js';
import touchStartActive from './touchStartActive.js';

const doubleTap = customCallbackHandler.bind(
  null,
  'DoubleTap',
  'doubleTapCallback'
);
// TODO: some touchDrag tools don't want to fire on touchStart
// TODO: Drag tools have an option `fireOnTouchStart` used to filter
// TODO: Them out of TOUCH_START handler
const touchDrag = customCallbackHandler.bind(
  null,
  'Touch',
  'touchDragCallback'
);
const touchEnd = customCallbackHandler.bind(null, 'Touch', 'touchEndCallback');
const touchPinch = customCallbackHandler.bind(
  null,
  'TouchPinch',
  'touchPinchCallback'
);
const touchPress = customCallbackHandler.bind(
  null,
  'Touch',
  'touchPressCallback'
);
const touchRotate = customCallbackHandler.bind(
  null,
  'TouchRotate',
  'touchRotateCallback'
);

export {
  doubleTap,
  multiTouchDrag,
  tap,
  touchDrag,
  touchEnd,
  touchPinch,
  touchPress,
  touchRotate,
  touchStart,
  touchStartActive,
};
