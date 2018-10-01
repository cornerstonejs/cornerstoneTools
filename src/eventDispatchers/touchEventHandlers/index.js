import customCallbackHandler from './../shared/customCallbackHandler.js';
import tap from './tap.js';
import touchStart from './touchStart.js';
import touchStartActive from './touchStartActive.js';

const doubleTap = customCallbackHandler.bind(
  null,
  'Touch',
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
  'Touch',
  'touchPinchCallback'
);
const touchPress = customCallbackHandler.bind(
  null,
  'Touch',
  'touchPressCallback'
);
const multiTouchDrag = customCallbackHandler.bind(
  null,
  'Touch',
  'multiTouchDragCallback'
);
const touchRotate = customCallbackHandler.bind(
  null,
  'Touch',
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
  touchStartActive
};
