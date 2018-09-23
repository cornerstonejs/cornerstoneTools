const moduleName = 'GLOBAL_CONFIGURATION';

export const state = {
  globalConfiguration: {
    touchEnabled: true
  }
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
  state.globalConfiguration = Object.assign(
    {},
    state.globalConfiguration,
    configuration
  );
};

export default {
  state,
  mutations
};
