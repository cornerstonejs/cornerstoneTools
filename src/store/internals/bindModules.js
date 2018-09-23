/**
 * Adds each module to the store. Binds the first parameter so that each mutation
 * has access to rootState, rootGetters, rootMutations, as well as the module's local
 * state, getters, and mutations
 *
 * @param {*} state
 * @param {*} getters
 * @param {*} mutations
 * @param {*} modules
 */
export default function (state, getters, mutations, modules) {
  modules.forEach((module) => {
    // Bind
    module.mutations = module.mutations || {};
    Object.keys(module.mutations).forEach(function (key) {
      this[key] = this[key].bind(null, {
        state: module.state,
        rootState: state,
        rootGetters: getters,
        rootMutations: mutations
      });

      // Merge modules w/ root
      state = Object.assign(state, module.state);
      getters = Object.assign(getters, module.getters);
      mutations = Object.assign(mutations, module.mutations);
    }, module.mutations);
  });
}
