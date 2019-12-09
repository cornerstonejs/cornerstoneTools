// Modules
import brush from './modules/brushModule.js';
import cursor from './modules/cursorModule.js';
import globalConfiguration from './modules/globalConfigurationModule.js';
import external from '../externalModules.js';

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
};

export const getters = {
  mouseMoveTools: () =>
    state.tools.filter(tool =>
      tool.supportedInteractionTypes.includes('MouseMove')
    ),
  mouseTools: () =>
    state.tools.filter(tool =>
      tool.supportedInteractionTypes.includes('Mouse')
    ),
  touchTools: () =>
    state.tools.filter(tool =>
      tool.supportedInteractionTypes.includes('Touch')
    ),
  keyboardTools: () =>
    state.tools.filter(tool =>
      tool.supportedInteractionTypes.includes('Keyboard')
    ),
  enabledElementByUID: enabledElementUID =>
    state.enabledElements.find(
      element =>
        external.cornerstone.getEnabledElement(element).uuid ===
        enabledElementUID
    ),
};

export const setters = {};

export const modules = {
  brush,
  cursor,
  globalConfiguration,
};

export default {
  modules,
  state,
  getters,
};
