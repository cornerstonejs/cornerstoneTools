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
    const moduleState = {};

    // Merge module state into root's state
    moduleState[module.name] = module.state;
    state = Object.assign(state, moduleState);
    getters = Object.assign(getters, module.getters);

    // Bind
    module.mutations = module.mutations || {};
    Object.keys(module.mutations).forEach(function (key) {
      this[key] = this[key].bind(null, {
        state,
        getters
      });
    }, module.mutations);

    mutations = Object.assign(mutations, module.mutations);
  });
}
