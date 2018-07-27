import customCallbackHandler from './shared/customCallbackHandler.js';
import onImageRendered from './onImageRendered.js';
import tap from './tap.js';
import touchDrag from './touchDrag.js';
import touchStart from './touchStart.js';
import touchStartActive from './touchStartActive.js';

const doubleTap = customCallbackHandler.bind(null, 'doubleTapCallback');
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
