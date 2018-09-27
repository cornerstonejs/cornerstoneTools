// Modules
import brush from './modules/brushModule.js';
import globalConfiguration from './modules/globalConfigurationModule.js';

export const state = {
  isToolLocked: false,
  tools: [],
  clickProximity: 6,
  mousePositionImage: {},
  enabledElements: []
};

export const getters = {
  mouseTools: () =>
    state.tools.filter((tool) =>
      tool.supportedInteractionTypes.includes('mouse')
    ),
  touchTools: () =>
    state.tools.filter((tool) =>
      tool.supportedInteractionTypes.includes('touch')
    ),
  enabledElementByUID: (enabledElementUID) =>
    state.enabledElements.filter(
      (enabledElement) => enabledElement.uuid === enabledElementUID
    )
};

export const setters = {};

export const modules = {
  brush,
  globalConfiguration
};

export default {
  modules,
  state,
  getters
};
