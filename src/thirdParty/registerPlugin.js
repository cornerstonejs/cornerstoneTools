import registerMixin from './registerMixin.js';
import registerModule from './registerModule.js';
import registerTool from './registerTool.js';
import { pluginList } from './index.js';

/**
 * Register a plugin.
 *
 * @
 * @param  {Object} newMixin The registerPlugin to register.
 */
export default function (plugin) {
  if (!plugin.name) {
    throw new Error (`plugin must have a unique name!`);
  }

  if (isPluginNameRegistered(plugin.name)) {
    console.warning(`A plugin with the name ${name} is already registered`);

    return;
  }

  // TODO: This isn't very atomic.
  // What if a plugin clashes with all names, yet still gets registered?

  if (plugin.mixins) {


    const mixins = plugin.mixins;

    for (let i = 0; i < mixins.length; i++) {
      // Would just pass mixin, but want to leave those endpoints more open for now.
      console.log(`registering Mixin: ${mixins[i].name}`);
      registerMixin(mixins[i].mixin, mixins[i].name);
    }
  }

  if (plugin.modules) {
    const modules = plugin.modules;

    for (let i = 0; i < modules.length; i++) {
      // Would just pass modules, but want to leave those endpoints more open for now.
      console.log(`registering Module: ${modules[i].name}`);
      registerModule(modules[i].module, modules[i].name);
    }
  }

  if (plugin.tools) {
    const tools = plugin.tools;

    for (let i = 0; i < tools.length; i++) {
      // Would just pass modules, but want to leave those endpoints more open for now.
      registerTool(tools[i].tool, tools[i].name);
    }
  }

  // TODO -> This is easily exensible.
  // We could have e.g. 3.X -> "Plugins can now include manipulators, just add
  // a manipulators array to your plugin file."
  //
  // TODO: Could also do version checking to see if the cTools version is recent
  // enough to be compatible with the plugin.

  pluginList.push(plugin.name);
}


function isPluginNameRegistered (name) {
  return pluginList.some((registeredPluginName) => {
    return registeredPluginName === name;
  });
}
