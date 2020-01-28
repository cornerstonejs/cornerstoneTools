/**
 * Root
 * @namespace CornerstoneTools
 */

/**
 * Drawing API to assist in consistent annotation creation
 * @namespace Drawing
 */

/**
 * Event dispatchers listen for events from `cornerstone` and `enabledElements`. Dispatchers
 * choose which tool(s) get to handle the event by looking at callbacks, priority, and other factors.
 * @private
 * @namespace EventDispatchers
 */

/**
 * Event listeners normalize events emitted by `cornerstone` and `enabledElements`. The listeners
 * then re-emit events prefixed with `cornerstonetools`. For example, `mousemove` becomes `cornerstonetoolsmousemove`.
 * Most of these events are caught by an `eventDispatcher`, and used to shape tool behavior.
 * @private
 * @namespace EventListeners
 */

/**
 * Manipulators describe a tool's `handle` behavior. Leveraging a small set of manipulators
 * allows us to create a consistent experience when interacting with tools via their handles.
 * @namespace Manipulators
 */

/**
 * Mixins are "tool beahviors" that can be added to a tool via its mixin
 * array configuration property
 * @namespace Mixins
 */

/**
 * StateManagement
 * @namespace StateManagement
 */

/**
 * Sync
 * @namespace Synchronization
 */

/**
 * Third party
 * @namespace ThirdParty
 */

/**
 * Tools
 * @namespace Tools
 */

/**
 * Tools that extend the {@link #Tools.Base.BaseAnnotationTool|`BaseAnnotationTool`}
 * @namespace Tools.Annotation
 */

/**
 * The parent (abstract) classes that all tools derive from.
 * @namespace Tools.Base
 */

/**
 * Tools that extend the {@link #Tools.Base.BaseBrushTool|`BaseBrushTool`}
 * @namespace Tools.Brush
 */

/**
 * Util
 * @namespace Util
 */

import {
  AngleTool,
  ArrowAnnotateTool,
  BidirectionalTool,
  CircleRoiTool,
  CobbAngleTool,
  EllipticalRoiTool,
  FreehandRoiTool,
  LengthTool,
  ProbeTool,
  RectangleRoiTool,
  TextMarkerTool,
} from './tools/annotation/index.js';
import {
  BrushTool,
  SphericalBrushTool,
  FreehandScissorsTool,
  RectangleScissorsTool,
  CircleScissorsTool,
  CorrectionScissorsTool,
} from './tools/segmentation/index.js';
import {
  CrosshairsTool,
  DoubleTapFitToWindowTool,
  DragProbeTool,
  EraserTool,
  FreehandRoiSculptorTool,
  MagnifyTool,
  OverlayTool,
  OrientationMarkersTool,
  PanMultiTouchTool,
  PanTool,
  ReferenceLinesTool,
  RotateTool,
  RotateTouchTool,
  ScaleOverlayTool,
  StackScrollMouseWheelTool,
  StackScrollMultiTouchTool,
  StackScrollTool,
  WwwcRegionTool,
  WwwcTool,
  ZoomMouseWheelTool,
  ZoomTool,
  ZoomTouchPinchTool,
} from './tools/index.js';

import { default as init } from './init.js';

// ~~~~~~ STACK TOOLS ~~~~~ //
import { default as stackPrefetch } from './stackTools/stackPrefetch.js';
import { default as stackRenderers } from './stackTools/stackRenderers.js';
import { playClip, stopClip } from './stackTools/playClip.js';

// ~~~~~~ STATE MANAGEMENT ~~~~~ //
import { default as store } from './store/index.js';
import { getModule } from './store/index.js';

import { default as getToolForElement } from './store/getToolForElement.js';
import { addTool, addToolForElement } from './store/addTool.js';
import { removeTool, removeToolForElement } from './store/removeTool.js';
import {
  setToolOptions,
  setToolOptionsForElement,
} from './store/setToolOptions.js';
import {
  setToolActive,
  setToolActiveForElement,
  setToolEnabled,
  setToolEnabledForElement,
  setToolDisabled,
  setToolDisabledForElement,
  setToolPassive,
  setToolPassiveForElement,
} from './store/setToolMode.js';
import isToolActiveForElement from './store/isToolActiveForElement';
import {
  addToolState,
  getToolState,
  removeToolState,
  clearToolState,
  setElementToolStateManager,
  getElementToolStateManager,
} from './stateManagement/toolState.js';
import { default as textStyle } from './stateManagement/textStyle.js';
import { default as toolStyle } from './stateManagement/toolStyle.js';
import { default as toolColors } from './stateManagement/toolColors.js';
import { default as toolCoordinates } from './stateManagement/toolCoordinates.js';
import {
  stackSpecificStateManager,
  newStackSpecificToolStateManager,
  addStackStateManager,
} from './stateManagement/stackSpecificStateManager.js';
import { default as loadHandlerManager } from './stateManagement/loadHandlerManager.js';
import {
  newImageIdSpecificToolStateManager,
  globalImageIdSpecificToolStateManager,
} from './stateManagement/imageIdSpecificStateManager.js';
import {
  newFrameOfReferenceSpecificToolStateManager,
  globalFrameOfReferenceSpecificToolStateManager,
} from './stateManagement/frameOfReferenceStateManager.js';
import { forceEnabledElementResize } from './eventListeners/windowResizeHandler.js';

// ~~~~~~ ORIENTATION  ~~~~~ //
import { default as orientation } from './orientation/index.js';

// ~~~~~~ CANVAS EXPORT  ~~~~~ //
import { default as SaveAs } from './util/SaveAs.js';
import {
  enable as enableLogger,
  disable as disableLogger,
} from './util/logger.js';

// ~~~~~~ THIRD PARTY SUPPORT  ~~~~~ //
import { default as register } from './thirdParty/register.js';
import { default as registerSome } from './thirdParty/registerSome.js';

// ~~~~~~ SYNCHRONIZERS ~~~~~ //
import { default as wwwcSynchronizer } from './synchronization/wwwcSynchronizer.js';
import { default as updateImageSynchronizer } from './synchronization/updateImageSynchronizer.js';
import { default as Synchronizer } from './synchronization/Synchronizer.js';
import { default as stackScrollSynchronizer } from './synchronization/stackScrollSynchronizer.js';
import { default as stackImagePositionSynchronizer } from './synchronization/stackImagePositionSynchronizer.js';
import { default as stackImagePositionOffsetSynchronizer } from './synchronization/stackImagePositionOffsetSynchronizer.js';
import { default as stackImageIndexSynchronizer } from './synchronization/stackImageIndexSynchronizer.js';
import { default as panZoomSynchronizer } from './synchronization/panZoomSynchronizer.js';

// ~~~~~~ REQUEST POOL MANAGER  ~~~~~ //
import { default as requestPoolManager } from './requestPool/requestPoolManager.js';

import { default as external } from './externalModules.js';
import { default as EVENTS } from './events.js';
import { default as version } from './version.js';

import importInternal from './importInternal.js';

const cornerstoneTools = {
  // ~~~ TOOLS
  // ~ Annotation Tools
  AngleTool,
  ArrowAnnotateTool,
  BidirectionalTool,
  CircleRoiTool,
  CobbAngleTool,
  EllipticalRoiTool,
  FreehandRoiTool,
  LengthTool,
  ProbeTool,
  RectangleRoiTool,
  TextMarkerTool,
  // ~ Segmentation Tools
  BrushTool,
  SphericalBrushTool,
  RectangleScissorsTool,
  FreehandScissorsTool,
  CircleScissorsTool,
  CorrectionScissorsTool,
  // ~ Tools
  CrosshairsTool,
  DoubleTapFitToWindowTool,
  DragProbeTool,
  EraserTool,
  FreehandRoiSculptorTool,
  MagnifyTool,
  OverlayTool,
  OrientationMarkersTool,
  PanMultiTouchTool,
  PanTool,
  ReferenceLinesTool,
  RotateTool,
  RotateTouchTool,
  ScaleOverlayTool,
  StackScrollMouseWheelTool,
  StackScrollMultiTouchTool,
  StackScrollTool,
  WwwcRegionTool,
  WwwcTool,
  ZoomMouseWheelTool,
  ZoomTool,
  ZoomTouchPinchTool,
  init,
  stackPrefetch,
  stackRenderers,
  playClip,
  stopClip,
  store,
  getModule,
  getToolForElement,
  addTool,
  addToolForElement,
  removeTool,
  removeToolForElement,
  setToolOptions,
  setToolOptionsForElement,
  isToolActiveForElement,
  setToolActive,
  setToolActiveForElement,
  setToolEnabled,
  setToolEnabledForElement,
  setToolDisabled,
  setToolDisabledForElement,
  setToolPassive,
  setToolPassiveForElement,
  addToolState,
  getToolState,
  removeToolState,
  clearToolState,
  setElementToolStateManager,
  getElementToolStateManager,
  textStyle,
  toolStyle,
  toolColors,
  toolCoordinates,
  stackSpecificStateManager,
  newStackSpecificToolStateManager,
  addStackStateManager,
  loadHandlerManager,
  newImageIdSpecificToolStateManager,
  globalImageIdSpecificToolStateManager,
  newFrameOfReferenceSpecificToolStateManager,
  globalFrameOfReferenceSpecificToolStateManager,
  forceEnabledElementResize,
  orientation,
  SaveAs,
  enableLogger,
  disableLogger,
  importInternal,
  import: importInternal,
  register,
  registerSome,
  wwwcSynchronizer,
  updateImageSynchronizer,
  Synchronizer,
  stackScrollSynchronizer,
  stackImagePositionSynchronizer,
  stackImagePositionOffsetSynchronizer,
  stackImageIndexSynchronizer,
  panZoomSynchronizer,
  requestPoolManager,
  external,
  EVENTS,
  version,
};

// Named Exports
export {
  // ~~~ TOOLS
  // ~ Annotation Tools
  AngleTool,
  ArrowAnnotateTool,
  BidirectionalTool,
  CircleRoiTool,
  CobbAngleTool,
  EllipticalRoiTool,
  FreehandRoiTool,
  LengthTool,
  ProbeTool,
  RectangleRoiTool,
  TextMarkerTool,
  // ~ Segmentation Tools
  BrushTool,
  SphericalBrushTool,
  RectangleScissorsTool,
  FreehandScissorsTool,
  CircleScissorsTool,
  CorrectionScissorsTool,
  // ~ Tools
  CrosshairsTool,
  DoubleTapFitToWindowTool,
  DragProbeTool,
  EraserTool,
  FreehandRoiSculptorTool,
  MagnifyTool,
  OverlayTool,
  OrientationMarkersTool,
  PanMultiTouchTool,
  PanTool,
  ReferenceLinesTool,
  RotateTool,
  RotateTouchTool,
  ScaleOverlayTool,
  StackScrollMouseWheelTool,
  StackScrollMultiTouchTool,
  StackScrollTool,
  WwwcRegionTool,
  WwwcTool,
  ZoomMouseWheelTool,
  ZoomTool,
  ZoomTouchPinchTool,
  init,
  stackPrefetch,
  stackRenderers,
  playClip,
  stopClip,
  store,
  getModule,
  getToolForElement,
  addTool,
  addToolForElement,
  removeTool,
  removeToolForElement,
  setToolOptions,
  setToolOptionsForElement,
  isToolActiveForElement,
  setToolActive,
  setToolActiveForElement,
  setToolEnabled,
  setToolEnabledForElement,
  setToolDisabled,
  setToolDisabledForElement,
  setToolPassive,
  setToolPassiveForElement,
  addToolState,
  getToolState,
  removeToolState,
  clearToolState,
  setElementToolStateManager,
  getElementToolStateManager,
  textStyle,
  toolStyle,
  toolColors,
  toolCoordinates,
  stackSpecificStateManager,
  newStackSpecificToolStateManager,
  addStackStateManager,
  loadHandlerManager,
  newImageIdSpecificToolStateManager,
  globalImageIdSpecificToolStateManager,
  newFrameOfReferenceSpecificToolStateManager,
  globalFrameOfReferenceSpecificToolStateManager,
  forceEnabledElementResize,
  orientation,
  SaveAs,
  enableLogger,
  disableLogger,
  register,
  registerSome,
  wwwcSynchronizer,
  updateImageSynchronizer,
  Synchronizer,
  stackScrollSynchronizer,
  stackImagePositionSynchronizer,
  stackImagePositionOffsetSynchronizer,
  stackImageIndexSynchronizer,
  panZoomSynchronizer,
  requestPoolManager,
  importInternal,
  external,
  EVENTS,
  version,
};

export { default as import } from './importInternal.js';

export default cornerstoneTools;
