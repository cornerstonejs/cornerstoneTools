import external from '@/externalModules.js';
import EVENTS from '@/events.js';
import saveAs from './tools/image/saveAs.js'; // Todo: move?
import {
  setToolOptions,
  getToolOptions } from './toolOptions.js';
import version from './version.js';

//
import referenceLines from './referenceLines/index.js';
import orientation from './orientation/index.js';

import requestPoolManager from './requestPool/requestPoolManager.js';

import setContextToDisplayFontSize from './util/setContextToDisplayFontSize.js';
import scrollToIndex from './util/scrollToIndex.js';
import scroll from './util/scroll.js';
import roundToDecimal from './util/roundToDecimal.js';
import { projectPatientPointToImagePlane,
  imagePointToPatientPoint,
  planePlaneIntersection } from './util/pointProjector.js';

import pointInsideBoundingBox from './util/pointInsideBoundingBox.js';
import pointInEllipse from './util/pointInEllipse.js';
import makeUnselectable from './util/makeUnselectable.js';
import isMouseButtonEnabled from './util/isMouseButtonEnabled.js';
import getRGBPixels from './util/getRGBPixels.js';
import { getDefaultSimultaneousRequests,
  getMaxSimultaneousRequests,
  getBrowserInfo,
  isMobileDevice } from './util/getMaxSimultaneousRequests.js';

import getLuminance from './util/getLuminance.js';
import drawTextBox from './util/drawTextBox.js';
import drawEllipse from './util/drawEllipse.js';
import drawCircle from './util/drawCircle.js';
import drawArrow from './util/drawArrow.js';
import copyPoints from './util/copyPoints.js';
import calculateSUV from './util/calculateSUV.js';
import calculateEllipseStatistics from './util/calculateEllipseStatistics.js';

// SYNCHRONIZER
import wwwcSynchronizer from './synchronization/wwwcSynchronizer.js';
import updateImageSynchronizer from './synchronization/updateImageSynchronizer.js';
import Synchronizer from './synchronization/Synchronizer.js';
import stackScrollSynchronizer from './synchronization/stackScrollSynchronizer.js';
import stackImagePositionSynchronizer from './synchronization/stackImagePositionSynchronizer.js';
import stackImagePositionOffsetSynchronizer from './synchronization/stackImagePositionOffsetSynchronizer.js';
import stackImageIndexSynchronizer from './synchronization/stackImageIndexSynchronizer.js';
import panZoomSynchronizer from './synchronization/panZoomSynchronizer.js';


// STATE MANAGEMENT
import toolStyle from './stateManagement/toolStyle.js';
import {
  addToolState,
  getToolState,
  removeToolState,
  clearToolState,
  setElementToolStateManager,
  getElementToolStateManager } from './stateManagement/toolState.js';
import toolCoordinates from './stateManagement/toolCoordinates.js';
import toolColors from './stateManagement/toolColors.js';
import { addTimeSeriesStateManager,
  newTimeSeriesSpecificToolStateManager } from './stateManagement/timeSeriesSpecificStateManager.js';
import textStyle from './stateManagement/textStyle.js';

import { stackSpecificStateManager,
  newStackSpecificToolStateManager,
  addStackStateManager } from './stateManagement/stackSpecificStateManager.js';

import loadHandlerManager from './stateManagement/loadHandlerManager.js';

import { newImageIdSpecificToolStateManager,
  globalImageIdSpecificToolStateManager } from './stateManagement/imageIdSpecificStateManager.js';

import { newFrameOfReferenceSpecificToolStateManager,
  globalFrameOfReferenceSpecificToolStateManager } from './stateManagement/frameOfReferenceStateManager.js';

import appState from './stateManagement/appState.js';

// MANIPULATORS
// Todo: These probably don't need to be top level API members
//       Should be consumed by tools/base tools
import anyHandlesOutsideImage from './manipulators/anyHandlesOutsideImage.js';
import drawHandles from './manipulators/drawHandles.js';
import getHandleNearImagePoint from './manipulators/getHandleNearImagePoint.js';
import handleActivator from './manipulators/handleActivator.js';
import moveAllHandles from './manipulators/moveAllHandles.js';
import moveHandle from './manipulators/moveHandle.js';
import moveNewHandle from './manipulators/moveNewHandle.js';
import moveNewHandleTouch from './manipulators/moveNewHandleTouch.js';
import touchMoveAllHandles from './manipulators/touchMoveAllHandles.js';
import touchMoveHandle from './manipulators/touchMoveHandle.js';

// INPUT SOURCES
// Todo: These probably don't need to be top level API members
//       Maybe a top level way to add new input sources? Or to
//       Add a tool utilizes an existing input source?
import keyboardInput from './inputSources/keyboardInput.js';
import mouseInput from './inputSources/mouseInput.js';
import mouseWheelInput from './inputSources/mouseWheelInput.js';
import preventGhostClick from './inputSources/preventGhostClick.js';
import touchInput from './inputSources/touchInput.js';


export default {
  external,
  EVENTS,
  saveAs,
  setToolOptions,
  getToolOptions,
  version,
  referenceLines,
  orientation,
  requestPoolManager,
  setContextToDisplayFontSize,
  scrollToIndex,
  scroll,
  roundToDecimal,
  projectPatientPointToImagePlane,
  imagePointToPatientPoint,
  planePlaneIntersection,
  pointInsideBoundingBox,
  pointInEllipse,
  makeUnselectable,
  isMouseButtonEnabled,
  getRGBPixels,
  getDefaultSimultaneousRequests,
  getMaxSimultaneousRequests,
  getBrowserInfo,
  isMobileDevice,
  getLuminance,
  drawTextBox,
  drawEllipse,
  drawCircle,
  drawArrow,
  copyPoints,
  calculateSUV,
  calculateEllipseStatistics,
  // Synchronizer
  wwwcSynchronizer,
  updateImageSynchronizer,
  Synchronizer,
  stackScrollSynchronizer,
  stackImagePositionSynchronizer,
  stackImagePositionOffsetSynchronizer,
  stackImageIndexSynchronizer,
  panZoomSynchronizer,
  // State
  toolStyle,
  addToolState,
  getToolState,
  removeToolState,
  clearToolState,
  setElementToolStateManager,
  getElementToolStateManager,
  toolCoordinates,
  toolColors,
  addTimeSeriesStateManager,
  newTimeSeriesSpecificToolStateManager,
  textStyle,
  stackSpecificStateManager,
  newStackSpecificToolStateManager,
  addStackStateManager,
  loadHandlerManager,
  newImageIdSpecificToolStateManager,
  globalImageIdSpecificToolStateManager,
  newFrameOfReferenceSpecificToolStateManager,
  globalFrameOfReferenceSpecificToolStateManager,
  //
  appState,
  // Manipulators
  anyHandlesOutsideImage,
  drawHandles,
  getHandleNearImagePoint,
  handleActivator,
  moveAllHandles,
  moveHandle,
  moveNewHandle,
  moveNewHandleTouch,
  touchMoveAllHandles,
  touchMoveHandle,
  // Input sources
  keyboardInput,
  mouseInput,
  mouseWheelInput,
  preventGhostClick,
  touchInput
};
