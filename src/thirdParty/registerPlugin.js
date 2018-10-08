import registerItems from './registerItems.js';
import registerModule from './registerModule.js';
import { lib } from '../lib.js';

/**
 * Register a plugin.
 *
 * @param  {Object} plugin The plugin to register.
 * @param  {boolean} [overwrite] Whether to overwrite, should a plugin of the
 *                               same name already be registered.
 */
export default function (plugin, overwrite = false) {
  if (!plugin.name) {
    throw new Error (`plugin must have a unique name!`);
  }

  if (!overwrite && isPluginNameRegistered(plugin.name)) {
    console.warn(`Plugin ${plugin.name} already registered.`);

    return;
  }

  if (plugin.module) {
    registerModule(plugin.name, plugin.module);
  }

  if (plugin.items) {
    registerItems(plugin.name, plugin.items, overwrite)
  }

}

function isPluginNameRegistered (namespace) {
  return lib[namespace] !== undefined;
}
