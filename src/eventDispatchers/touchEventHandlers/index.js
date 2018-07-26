import applyCustomCallbackToActivateTool from './shared/applyCustomCallbackToActiveTool.js';
import onImageRendered from './onImageRendered.js';
import tap from './tap.js';
import touchDrag from './touchDrag.js';
import touchStart from './touchStart.js';
import touchStartActive from './touchStartActive.js';

const doubleTap = applyCustomCallbackToActivateTool.bind(
  null,
  'doubleTapCallback'
);

const touchEnd = applyCustomCallbackToActivateTool.bind(
  null,
  'touchEndCallback'
);

const touchPinch = applyCustomCallbackToActivateTool.bind(
  null,
  'touchPinchCallback'
);

const touchPress = applyCustomCallbackToActivateTool.bind(
  null,
  'touchPressCallback'
);

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
