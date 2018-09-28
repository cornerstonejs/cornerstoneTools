import registerPlugin from './registerPlugin.js';
import registerMixin from './registerMixin.js';
import registerModule from './registerModule.js';
import registerTool from './registerTool.js';

// TODO: Maybe these belongs in store? Not sure.
const tools = {}; // Object of imported tool constuctors.
const pluginList = []; // List of plugins imported.

export { tools, pluginList };

export default {
  registerPlugin,
  registerMixin,
  registerModule,
  registerTool,
  tools,
  pluginList
};
