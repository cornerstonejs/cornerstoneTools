// Modules
import segmentation from './modules/segmentationModule';
import cursor from './modules/cursorModule.js';
import globalConfiguration from './modules/globalConfigurationModule.js';
import external from '../externalModules.js';
import { getLogger } from '../util/logger.js';

const logger = getLogger('store:modules:storeLogger');

export const state = {
  // Global
  globalTools: {},
  globalToolChangeHistory: [],
  // Tracking
  enabledElements: [],
  tools: [],
  isToolLocked: false,
  activeMultiPartTool: null,
  mousePositionImage: {},
  // Settings
  clickProximity: 6,
  touchProximity: 10,
  handleRadius: 6,
  deleteIfHandleOutsideImage: true,
  preventHandleOutsideImage: false,
  // Cursor
  svgCursorUrl: null,
  //
};

const _internalState = {
  inFlightManipulatorsForJamesDannyAndBruno: {},
};

export const getters = {
  mouseTools: () =>
    state.tools.filter(tool =>
      tool.supportedInteractionTypes.includes('Mouse')
    ),
  touchTools: () =>
    state.tools.filter(tool =>
      tool.supportedInteractionTypes.includes('Touch')
    ),
  enabledElementByUID: enabledElementUID =>
    state.enabledElements.find(
      element =>
        external.cornerstone.getEnabledElement(element).uuid ===
        enabledElementUID
    ),
};

export const setters = {
  addInFlightManipulatorThing: (annotationUuid, cancelFn) => {
    const inFlightManipulators =
      _internalState.inFlightManipulatorsForJamesDannyAndBruno;

    inFlightManipulators[annotationUuid] = cancelFn;
  },
  // Single
  removeInFlightManipulatorThing: annotationUuid => {
    const inFlightManipulators =
      _internalState.inFlightManipulatorsForJamesDannyAndBruno;

    const cancelFn = inFlightManipulators[annotationUuid]();

    if (cancelFn) {
      cancelFn();
    }

    delete inFlightManipulators[annotationUuid];
  },
  // All
  cancelAllInFlightManipulatorThings: () => {
    const inFlightManipulators =
      _internalState.inFlightManipulatorsForJamesDannyAndBruno;
    const allInFlightAnnotationUuids = Object.keys(inFlightManipulators);

    allInFlightAnnotationUuids.forEach(uuid =>
      setters.removeInFlightManipulatorThing(uuid)
    );
  },
};

// CsTools.store.state.setters.cancelAllInFlightManipulatorThings

export const modules = {
  segmentation,
  cursor,
  globalConfiguration,
};

export function getModule(moduleName) {
  return modules[moduleName];
}

export default {
  modules,
  state,
  getters,
  setters,
};
