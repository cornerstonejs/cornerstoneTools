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
    <path stroke="ACTIVE_COLOR" d="M8 16L8 0" id="dUU9BLALA"></path>
    <path stroke="ACTIVE_COLOR" d="M16 8L0 8" id="b9wR4oWz"></path>
  `,
};

const setters = {
  defaultOptions: newOptions => {
    Object.assign(state, options);
  },
};

const getters = {
  defaultOptions: () => {
    return state;
  },
};

export default {
  getters,
  setters,
};
