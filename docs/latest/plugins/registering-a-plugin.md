## Registering A Plugin {#registering-a-plugin}

All plugins that are to be used within the application should be registered right after `cornerstoneTools` is initialized, e.g.:

```js
import helloWorldPlugin from './helloWorldPlugin.js';
import anotherPlugin from './anotherPlugin.js';

const cTools = cornerstoneTools.init();

cTools.thirdParty.registerPlugin(helloWorldPlugin);
cTools.thirdParty.registerPlugin(anotherPlugin);
```

An example of how to construct and register a simple plugin is available in `examples/plugin`.
