// Modules
import brush from './modules/brushModule.js';
import globalConfiguration from './modules/globalConfigurationModule.js';

export const state = {
  globalTools: {},
  globalToolChangeHistory: [],
  tools: [],
  isToolLocked: false,
  clickProximity: 6,
  touchProximity: 10,
  mousePositionImage: {},
  enabledElements: [],
  deleteIfHandleOutsideImage: true,
  preventHandleOutsideImage: false,
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
    state.enabledElements.filter(
      enabledElement => enabledElement.uuid === enabledElementUID
    ),
};

export const setters = {};

export const modules = {
  brush,
  globalConfiguration,
};

export default {
  modules,
  state,
  getters,
};
