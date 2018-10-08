import BaseTool from './base/BaseTool.js';
import BaseAnnotationTool from './base/BaseAnnotationTool.js';
import BaseBrushTool from './base/BaseBrushTool.js';

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

import activeOrDisabledBinaryTool from './mixins/activeOrDisabledBinaryTool.js';
import enabledOrDisabledBinaryTool from './mixins/enabledOrDisabledBinaryTool.js';

import textStyle from './stateManagement/textStyle.js';
import toolColors from './stateManagement/toolColors.js';
import toolCoordinates from './stateManagement/toolCoordinates.js';
import {
  addToolState,
  getToolState,
  removeToolState,
  clearToolState,
  setElementToolStateManager,
  getElementToolStateManager
} from './stateManagement/toolState.js';
import {
  addTimeSeriesStateManager,
  newTimeSeriesSpecificToolStateManager
} from './stateManagement/timeSeriesSpecificStateManager.js';
import {
  stackSpecificStateManager,
  newStackSpecificToolStateManager,
  addStackStateManager
} from './stateManagement/stackSpecificStateManager.js';
import loadHandlerManager from './stateManagement/loadHandlerManager.js';
import {
  newImageIdSpecificToolStateManager,
  globalImageIdSpecificToolStateManager
} from './stateManagement/imageIdSpecificStateManager.js';
import {
  newFrameOfReferenceSpecificToolStateManager,
  globalFrameOfReferenceSpecificToolStateManager
} from './stateManagement/frameOfReferenceStateManager.js';
import {
  setToolPassiveForElement,
  setToolActiveForElement,
  setToolEnabledForElement,
  setToolDisabledForElement
} from './store/setToolMode.js';
import {
  state,
  getters,
  modules
} from './store/index.js';
import {
  getNewContext,
  draw,
  path,
  setShadow,
  drawLine,
  drawLines,
  drawJoinedLines,
  drawCircle,
  drawEllipse,
  drawRect,
  fillBox,
  fillTextLines
} from './util/drawing.js';
import drawTextBox from './util/drawTextBox.js';
import drawArrow from './util/drawArrow.js';
import getLuminance from './util/getLuminance.js';
import copyPoints from './util/copyPoints.js';
import calculateSUV from './util/calculateSUV.js';
import calculateEllipseStatistics from './util/calculateEllipseStatistics.js';
import setContextToDisplayFontSize from './util/setContextToDisplayFontSize.js';
import scrollToIndex from './util/scrollToIndex.js';
import scroll from './util/scroll.js';
import roundToDecimal from './util/roundToDecimal.js';
import {
  projectPatientPointToImagePlane,
  imagePointToPatientPoint,
  planePlaneIntersection
} from './util/pointProjector.js';

import pointInsideBoundingBox from './util/pointInsideBoundingBox.js';
import pointInEllipse from './util/pointInEllipse.js';
import makeUnselectable from './util/makeUnselectable.js';
import getRGBPixels from './util/getRGBPixels.js';
import {
  getDefaultSimultaneousRequests,
  getMaxSimultaneousRequests,
  getBrowserInfo,
  isMobileDevice
} from './util/getMaxSimultaneousRequests.js';
import wwwcSynchronizer from './synchronization/wwwcSynchronizer.js';
import updateImageSynchronizer from './synchronization/updateImageSynchronizer.js';
import Synchronizer from './synchronization/Synchronizer.js';
import stackScrollSynchronizer from './synchronization/stackScrollSynchronizer.js';
import stackImagePositionSynchronizer from './synchronization/stackImagePositionSynchronizer.js';
import stackImagePositionOffsetSynchronizer from './synchronization/stackImagePositionOffsetSynchronizer.js';
import stackImageIndexSynchronizer from './synchronization/stackImageIndexSynchronizer.js';
import panZoomSynchronizer from './synchronization/panZoomSynchronizer.js';
import requestPoolManager from './requestPool/requestPoolManager.js';

export const lib = {
  store: {
    state,
    getters,
    modules,
    setToolMode: {
      setToolPassiveForElement,
      setToolActiveForElement,
      setToolDisabledForElement,
      setToolEnabledForElement
    }
  },
  core: {
    base: {
      BaseTool,
      BaseAnnotationTool,
      BaseBrushTool
    },
    manipulators: {
      anyHandlesOutsideImage,
      drawHandles,
      getHandleNearImagePoint,
      handleActivator,
      moveAllHandles,
      moveHandle,
      moveNewHandle,
      moveNewHandleTouch,
      touchMoveAllHandles,
      touchMoveHandle
    },
    mixins: {
      activeOrDisabledBinaryTool,
      enabledOrDisabledBinaryTool
    },
    stateManagement: {
      textStyle,
      toolColors,
      toolCoordinates,
      addToolState,
      getToolState,
      removeToolState,
      clearToolState,
      setElementToolStateManager,
      getElementToolStateManager,
      addTimeSeriesStateManager,
      newTimeSeriesSpecificToolStateManager,
      stackSpecificStateManager,
      newStackSpecificToolStateManager,
      addStackStateManager,
      loadHandlerManager,
      newImageIdSpecificToolStateManager,
      globalImageIdSpecificToolStateManager,
      newFrameOfReferenceSpecificToolStateManager,
      globalFrameOfReferenceSpecificToolStateManager
    },
    drawing: {
      getNewContext,
      draw,
      path,
      setShadow,
      drawLine,
      drawLines,
      drawJoinedLines,
      drawCircle,
      drawEllipse,
      drawRect,
      drawTextBox,
      drawArrow,
      fillBox,
      fillTextLines
    },
    util: {
      getLuminance,
      copyPoints,
      calculateSUV,
      calculateEllipseStatistics,
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
      getRGBPixels,
      getDefaultSimultaneousRequests,
      getMaxSimultaneousRequests,
      getBrowserInfo,
      isMobileDevice
    },
    synchronization: {
      wwwcSynchronizer,
      updateImageSynchronizer,
      Synchronizer,
      stackScrollSynchronizer,
      stackImagePositionSynchronizer,
      stackImagePositionOffsetSynchronizer,
      stackImageIndexSynchronizer,
      panZoomSynchronizer
    },
    requestPool: {
      requestPoolManager
    }
  }
};
