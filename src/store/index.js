export const state = {
  isToolLocked: false,
  tools: []
};

export const getters = {
  mouseTools: () =>
    state.tools.filter((tool) =>
      tool.supportedInteractionTypes.includes('mouse')
    ),
  touchTools: () =>
    state.tools.filter((tool) => tool.supportedInteractionTypes.includes('touch'))
};

export const mutations = {
  SET_IS_TOOL_LOCKED: (isLocked) => {
    state.isToolLocked = isLocked;
  }
};

export default {
  state,
  getters,
  mutations
};
