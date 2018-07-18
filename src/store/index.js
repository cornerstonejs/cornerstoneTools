export const state = {
  tools: []
};
export const getters = {
  mouseTools: () => state.tools.filter((tool) => tool.isMouseTool),
  touchTools: () => state.tools.filter((tool) => tool.isTouchTool)
};

export default {
  state,
  getters
};
