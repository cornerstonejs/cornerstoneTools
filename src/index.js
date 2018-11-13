/**
 * Root
 * @namespace CornerstoneTools
 */

/**
 * Drawing API to assist in consistant annotation creation
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
 * Brush tools
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
  CobbAngleTool,
  EllipticalRoiTool,
  FreehandMouseTool,
  LengthTool,
  ProbeTool,
  RectangleRoiTool,
  TextMarkerTool,
} from './tools/annotation/index.js';
import { BrushTool } from './tools/brush/index.js';
import {
  CrosshairsTool,
  DoubleTapFitToWindowTool,
  DragProbeTool,
  EraserTool,
  FreehandSculpterMouseTool,
  MagnifyTool,
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

export {
  // ~~~ TOOLS
  // ~ Annotation Tools
  AngleTool,
  ArrowAnnotateTool,
  BidirectionalTool,
  CobbAngleTool,
  EllipticalRoiTool,
  FreehandMouseTool,
  LengthTool,
  ProbeTool,
  RectangleRoiTool,
  TextMarkerTool,
  // ~ Brush Tools
  BrushTool,
  // ~ Tools
  CrosshairsTool,
  DoubleTapFitToWindowTool,
  DragProbeTool,
  EraserTool,
  FreehandSculpterMouseTool,
  MagnifyTool,
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
};

export { default as init } from './init.js';

// ~~~~~~ STACK TOOLS ~~~~~ //
export { default as stackPrefetch } from './stackTools/stackPrefetch.js';
export { default as stackRenderers } from './stackTools/stackRenderers.js';
export { playClip, stopClip } from './stackTools/playClip.js';

// ~~~~~~ STATE MANAGEMENT ~~~~~ //
export { default as store } from './store/index.js';
export { default as getToolForElement } from './store/getToolForElement.js';
export { addTool, addToolForElement } from './store/addTool.js';
export { removeTool, removeToolForElement } from './store/removeTool.js';
export {
  setToolOptions,
  setToolOptionsForElement,
} from './store/setToolOptions.js';
export {
  setToolActive,
  setToolActiveForElement,
  setToolEnabled,
  setToolEnabledForElement,
  setToolDisabled,
  setToolDisabledForElement,
  setToolPassive,
  setToolPassiveForElement,
} from './store/setToolMode.js';
export {
  addToolState,
  getToolState,
  removeToolState,
  clearToolState,
  setElementToolStateManager,
  getElementToolStateManager,
} from './stateManagement/toolState.js';
export { default as textStyle } from './stateManagement/textStyle.js';
export { default as toolStyle } from './stateManagement/toolStyle.js';
export { default as toolColors } from './stateManagement/toolColors.js';
export {
  default as toolCoordinates,
} from './stateManagement/toolCoordinates.js';
export {
  stackSpecificStateManager,
  newStackSpecificToolStateManager,
  addStackStateManager,
} from './stateManagement/stackSpecificStateManager.js';
export {
  default as loadHandlerManager,
} from './stateManagement/loadHandlerManager.js';
export {
  newImageIdSpecificToolStateManager,
  globalImageIdSpecificToolStateManager,
} from './stateManagement/imageIdSpecificStateManager.js';
export {
  newFrameOfReferenceSpecificToolStateManager,
  globalFrameOfReferenceSpecificToolStateManager,
} from './stateManagement/frameOfReferenceStateManager.js';
export {
  forceEnabledElementResize,
} from './eventListeners/windowResizeHandler.js';

// ~~~~~~ ORIENTATION  ~~~~~ //
export { default as orientation } from './orientation/index.js';

// ~~~~~~ CANVAS EXPORT  ~~~~~ //
export { default as SaveAs } from './util/SaveAs.js';

// ~~~~~~ THIRD PARTY SUPPORT  ~~~~~ //
export { default as import } from './import.js';
export { default as register } from './thirdParty/register.js';
export { default as registerSome } from './thirdParty/registerSome.js';

// ~~~~~~ SYNCHRONIZERS ~~~~~ //
export {
  default as wwwcSynchronizer,
} from './synchronization/wwwcSynchronizer.js';
export {
  default as updateImageSynchronizer,
} from './synchronization/updateImageSynchronizer.js';
export { default as Synchronizer } from './synchronization/Synchronizer.js';
export {
  default as stackScrollSynchronizer,
} from './synchronization/stackScrollSynchronizer.js';
export {
  default as stackImagePositionSynchronizer,
} from './synchronization/stackImagePositionSynchronizer.js';
export {
  default as stackImagePositionOffsetSynchronizer,
} from './synchronization/stackImagePositionOffsetSynchronizer.js';
export {
  default as stackImageIndexSynchronizer,
} from './synchronization/stackImageIndexSynchronizer.js';
export {
  default as panZoomSynchronizer,
} from './synchronization/panZoomSynchronizer.js';

// ~~~~~~ REQUEST POOL MANAGER  ~~~~~ //
export {
  default as requestPoolManager,
} from './requestPool/requestPoolManager.js';

export { default as external } from './externalModules.js';
export { default as EVENTS } from './events.js';
export { default as version } from './version.js';
