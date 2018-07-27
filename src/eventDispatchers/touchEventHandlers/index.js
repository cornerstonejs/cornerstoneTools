import customCallbackHandler from './shared/customCallbackHandler.js';
import onImageRendered from './onImageRendered.js';
import tap from './tap.js';
import touchStart from './touchStart.js';
import touchStartActive from './touchStartActive.js';

const doubleTap = customCallbackHandler.bind(null, 'doubleTapCallback');
// TODO: some touchDrag tools don't want to fire on touchStart
// TODO: Drag tools have an option `fireOnTouchStart` used to filter
// TODO: Them out of TOUCH_START handler
const touchDrag = customCallbackHandler.bind(null, 'touchDragCallback');
const touchEnd = customCallbackHandler.bind(null, 'touchEndCallback');
const touchPinch = customCallbackHandler.bind(null, 'touchPinchCallback');
const touchPress = customCallbackHandler.bind(null, 'touchPressCallback');

export {
  doubleTap,
  onImageRendered,
  tap,
  touchDrag,
  touchEnd,
  touchPinch,
  touchPress,
  touchStart,
  touchStartActive
};
