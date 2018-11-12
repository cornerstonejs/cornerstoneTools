/**
 * Manipulators describe a tool's `handle` behavior. Leveraging a small set of manipulators
 * allows us to create a consistent experience when interacting with tools via their handles.
 * @namespace CornerstoneTools.Manipulators
 */

import anyHandleOutsideImage from './anyHandlesOutsideImage.js';
import getHandleNearImagePoint from './getHandleNearImagePoint.js';
import handleActivator from './handleActivator.js';
import moveAllHandles from './moveAllHandles.js';
import moveHandle from './moveHandle.js';
import moveNewHandle from './moveNewHandle.js';
import moveNewHandleTouch from './moveNewHandleTouch.js';
import touchMoveAllHandles from './touchMoveAllHandles.js';
import touchMoveHandle from './touchMoveHandle.js';

export {
  anyHandleOutsideImage,
  getHandleNearImagePoint,
  handleActivator,
  moveAllHandles,
  moveHandle,
  moveNewHandle,
  moveNewHandleTouch,
  touchMoveAllHandles,
  touchMoveHandle,
};
