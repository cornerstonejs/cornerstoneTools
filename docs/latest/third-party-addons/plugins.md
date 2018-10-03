## Plugins {#plugins}

If you have a selection of modules, mixins, and tools that depend on each other, you might consider packaging them up into a single plugin.

The schema of a plugin is as follows:

```js
const samplePlugin = {
  //Mandatory
  name: 'samplePlugin',

  // Optional
  mixins: [
    {
      mixin, // Mixin Object
      name   // Name of the mixin
    },
    ...
  ],

  // Optional
  modules: [
    {
      module, // Module Object
      name  // Name of the module
    },
    ...
  ],

  // Optional
  tools: [
    {
      tool:  // The tool Class / Constructor.
      name: // Name of the Tool.
    }
  ]

};
```

All tools require a name field, and may include any number of mixins, modules and tools.

### Registering a Plugin

You should register plugins after initialization of your `cornerstoneTools` instance, as follows:

```js
import helloWorldPlugin from './helloWorldPlugin.js';

const cTools = cornerstoneTools.init();

cTools.thirdParty.registerPlugin(helloWorldPlugin);
```

An example of how to register a plugin is available in `examples/plugin`.
