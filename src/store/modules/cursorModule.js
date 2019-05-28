const state = {
  iconSize: 16,
  viewBox: {
    x: 16,
    y: 16,
  },
  mousePoint: {
    x: 8,
    y: 8,
  },
  mousePointerGroupString: `
    <path stroke="ACTIVE_COLOR" d="M8 16L8 0"></path>
    <path stroke="ACTIVE_COLOR" d="M16 8L0 8"></path>
  `,
};

const setters = {
  defaultOptions: newOptions => {
    Object.assign(state, newOptions);
  },
};

const getters = {
  defaultOptions: () => state,
};

export default {
  getters,
  setters,
};
