import brush from './brushStore.js';

export const state = {
  isToolLocked: false,
  tools: [],
  clickProximity: 6,
  mousePositionImage: {}
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
  mousePositionImage: () => {
    return state.mousePositionImage;
  }
};

export const setters = {
  mousePositionImage: (mousePositionImage) => {
    state.mousePositionImage = mousePositionImage;
  }
};

export const mutations = {
  SET_IS_TOOL_LOCKED: (isLocked) => {
    state.isToolLocked = isLocked;
  }
};

export default {
  modules: {
    brush
  },
  state,
  getters,
  mutations
};
