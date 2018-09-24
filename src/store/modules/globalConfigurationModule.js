const name = 'globalConfiguration';
const moduleName = 'GLOBAL_CONFIGURATION';

export const state = {
  touchEnabled: true
};

export const mutations = {};

/**
 * Merge's the provided configuration with the existing config.
 *
 * @param {*} { state }
 * @param {*} configuration
 */
mutations[`${moduleName}_SET_CONFIGURATION`] = function (
  { state },
  configuration
) {
  state[name] = Object.assign({}, state[name], configuration);
};

export default {
  name,
  state,
  mutations
};
