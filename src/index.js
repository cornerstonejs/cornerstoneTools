/* Private Imports
 *
 * We're using these imports to build our default export.
*/
import external from './externalModules.js';
import EVENTS from './events.js';
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


/* Public API for CornerstoneTools
 * Ie. import cornerstoneTools from 'cornerstone-tools'
 *
 * Todo: This needs thinned to the essentials. So far, we've only
 * pulled out the tools to their own separate corner.
*/
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


/* Named exports
 *
 * - Can _all_ be pulled in with:
 * `import * as CornerstoneTools from 'cornerstone-tools'`
 *
 * - Can be pulled in individually
 * `import { EVENTS, getLuminance } from 'cornerstone-tools'`
 *
 * TODO: In a future version, named exports will be limited to modules
 * outside of the default export. IE. tools, helpers, etc.
*/
export { default as external } from './externalModules.js';
export { default as EVENTS } from './events.js';

export { default as referenceLines } from './referenceLines/index.js';
export { default as orientation } from './orientation/index.js';

export { default as requestPoolManager } from './requestPool/requestPoolManager.js';

export { default as setContextToDisplayFontSize } from './util/setContextToDisplayFontSize.js';
export { default as scrollToIndex } from './util/scrollToIndex.js';
export { default as scroll } from './util/scroll.js';
export { default as roundToDecimal } from './util/roundToDecimal.js';
export { projectPatientPointToImagePlane,
  imagePointToPatientPoint,
  planePlaneIntersection } from './util/pointProjector.js';

export { default as pointInsideBoundingBox } from './util/pointInsideBoundingBox.js';
export { default as pointInEllipse } from './util/pointInEllipse.js';
export { default as makeUnselectable } from './util/makeUnselectable.js';
export { default as isMouseButtonEnabled } from './util/isMouseButtonEnabled.js';
export { default as getRGBPixels } from './util/getRGBPixels.js';
export { getDefaultSimultaneousRequests,
  getMaxSimultaneousRequests,
  getBrowserInfo,
  isMobileDevice } from './util/getMaxSimultaneousRequests.js';

export { default as getLuminance } from './util/getLuminance.js';
export { default as drawTextBox } from './util/drawTextBox.js';
export { default as drawEllipse } from './util/drawEllipse.js';
export { default as drawCircle } from './util/drawCircle.js';
export { default as drawArrow } from './util/drawArrow.js';
export { default as copyPoints } from './util/copyPoints.js';
export { default as calculateSUV } from './util/calculateSUV.js';
export { default as calculateEllipseStatistics } from './util/calculateEllipseStatistics.js';

export { default as probeTool4D } from './tools/timeSeries/probeTool4D.js';
export { default as incrementTimePoint } from './tools/timeSeries/incrementTimePoint.js';
export { default as timeSeriesPlayer } from './tools/timeSeries/timeSeriesPlayer.js';
export { timeSeriesScroll,
  timeSeriesScrollWheel,
  timeSeriesScrollTouchDrag } from './tools/timeSeries/timeSeriesScroll.js';

export { default as wwwcSynchronizer } from './synchronization/wwwcSynchronizer.js';
export { default as updateImageSynchronizer } from './synchronization/updateImageSynchronizer.js';
export { default as Synchronizer } from './synchronization/Synchronizer.js';
export { default as stackScrollSynchronizer } from './synchronization/stackScrollSynchronizer.js';
export { default as stackImagePositionSynchronizer } from './synchronization/stackImagePositionSynchronizer.js';
export { default as stackImagePositionOffsetSynchronizer } from './synchronization/stackImagePositionOffsetSynchronizer.js';
export { default as stackImageIndexSynchronizer } from './synchronization/stackImageIndexSynchronizer.js';
export { default as panZoomSynchronizer } from './synchronization/panZoomSynchronizer.js';

export { default as toolStyle } from './stateManagement/toolStyle.js';
export { addToolState,
  getToolState,
  removeToolState,
  clearToolState,
  setElementToolStateManager,
  getElementToolStateManager } from './stateManagement/toolState.js';
export { default as toolCoordinates } from './stateManagement/toolCoordinates.js';
export { default as toolColors } from './stateManagement/toolColors.js';
export { addTimeSeriesStateManager,
  newTimeSeriesSpecificToolStateManager } from './stateManagement/timeSeriesSpecificStateManager.js';
export { default as textStyle } from './stateManagement/textStyle.js';

export { stackSpecificStateManager,
  newStackSpecificToolStateManager,
  addStackStateManager } from './stateManagement/stackSpecificStateManager.js';

export { default as loadHandlerManager } from './stateManagement/loadHandlerManager.js';

export { newImageIdSpecificToolStateManager,
  globalImageIdSpecificToolStateManager } from './stateManagement/imageIdSpecificStateManager.js';

export { newFrameOfReferenceSpecificToolStateManager,
  globalFrameOfReferenceSpecificToolStateManager } from './stateManagement/frameOfReferenceStateManager.js';

export { default as appState } from './stateManagement/appState.js';

export { default as stackScrollKeyboard } from './tools/stack/stackScrollKeyboard.js';

export { stackScroll,
  stackScrollWheel,
  stackScrollTouchDrag,
  stackScrollMultiTouch } from './tools/stack/stackScroll.js';

export { default as stackPrefetch } from './tools/stack/stackPrefetch.js';
export { default as scrollIndicator } from './tools/stack/scrollIndicator.js';
export { default as stackRenderers } from './tools/stack/stackRenderers.js';
export { playClip, stopClip } from './tools/stack/playClip.js';

export { default as anyHandlesOutsideImage } from './manipulators/anyHandlesOutsideImage.js';
export { default as drawHandles } from './manipulators/drawHandles.js';
export { default as getHandleNearImagePoint } from './manipulators/getHandleNearImagePoint.js';
export { default as handleActivator } from './manipulators/handleActivator.js';
export { default as moveAllHandles } from './manipulators/moveAllHandles.js';
export { default as moveHandle } from './manipulators/moveHandle.js';
export { default as moveNewHandle } from './manipulators/moveNewHandle.js';
export { default as moveNewHandleTouch } from './manipulators/moveNewHandleTouch.js';
export { default as touchMoveAllHandles } from './manipulators/touchMoveAllHandles.js';
export { default as touchMoveHandle } from './manipulators/touchMoveHandle.js';

export { default as keyboardInput } from './inputSources/keyboardInput.js';
export { default as mouseInput } from './inputSources/mouseInput.js';
export { default as mouseWheelInput } from './inputSources/mouseWheelInput.js';
export { default as preventGhostClick } from './inputSources/preventGhostClick.js';
export { default as touchInput } from './inputSources/touchInput.js';


export { angle, angleTouch } from './tools/image/angleTool.js';
export { arrowAnnotate, arrowAnnotateTouch } from './tools/image/arrowAnnotate.js';
export { crosshairs, crosshairsTouch } from './tools/image/crosshairs.js';
export { default as displayTool } from './tools/image/displayTool.js';
export { default as doubleTapTool } from './tools/base/doubleTapTool.js';
export { default as doubleTapZoom } from './tools/image/doubleTapZoom.js';
export { dragProbe, dragProbeTouch } from './tools/image/dragProbe.js';

export { ellipticalRoi, ellipticalRoiTouch } from './tools/image/ellipticalRoi.js';
export { freehand } from './tools/image/freehand.js';

export { highlight, highlightTouch } from './tools/image/highlight.js';
export { default as imageStats } from './tools/image/imageStats.js';
export { default as keyboardTool } from './tools/base/keyboardTool.js';
export { length, lengthTouch } from './tools/image/length.js';
export { magnify, magnifyTouchDrag } from './tools/image/magnify.js';
export { default as mouseButtonRectangleTool } from './tools/base/mouseButtonRectangleTool.js';
export { default as mouseButtonTool } from './tools/base/mouseButtonTool.js';
export { default as mouseWheelTool } from './tools/base/mouseWheelTool.js';
export { default as multiTouchDragTool } from './tools/base/multiTouchDragTool.js';
export { default as orientationMarkers } from './tools/image/orientationMarkers.js';

export { pan, panTouchDrag } from './tools/image/pan.js';
export { default as panMultiTouch } from './tools/image/panMultiTouch.js';
export { probe, probeTouch } from './tools/image/probe.js';
export { rectangleRoi, rectangleRoiTouch } from './tools/image/rectangleRoi.js';
export { rotate, rotateTouchDrag } from './tools/image/rotate.js';
export { default as rotateTouch } from './tools/image/rotateTouch.js';
export { default as saveAs } from './tools/image/saveAs.js';
export { default as scaleOverlayTool } from './tools/image/scaleOverlayTool.js';
export { seedAnnotate, seedAnnotateTouch } from './tools/image/seedAnnotate.js';
export { simpleAngle, simpleAngleTouch } from './tools/image/simpleAngle.js';
export { default as simpleMouseButtonTool } from './tools/base/simpleMouseButtonTool.js';
export { textMarker, textMarkerTouch } from './tools/image/textMarker.js';

export { default as touchDragTool } from './tools/base/touchDragTool.js';
export { default as touchPinchTool } from './tools/base/touchPinchTool.js';
export { default as touchTool } from './tools/base/touchTool.js';
export { wwwc, wwwcTouchDrag } from './tools/image/wwwc.js';
export { wwwcRegion, wwwcRegionTouch } from './tools/image/wwwcRegion.js';
export { zoom,
  zoomWheel,
  zoomTouchPinch,
  zoomTouchDrag } from './tools/image/zoom.js';
export { brush } from './tools/painting/brush.js';
export { adaptiveBrush } from './tools/painting/adaptiveBrush.js';
export { default as version } from './version.js';

export { setToolOptions, getToolOptions } from './toolOptions.js';
