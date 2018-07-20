export const state = {
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

export default {
  state,
  getters
};
