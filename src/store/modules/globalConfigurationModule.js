const namespace = 'globalConfiguration';
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
  state[namespace] = Object.assign({}, state[namespace], configuration);
};

export default {
  name,
  state,
  mutations
};
