## Mode Change Callbacks {#mode-change-callbacks}

In the `cornerstoneTools` framework if a tool changes mode, an appropriate callback is called if the tool has one. These are, quite simply:

- active - `activeCallback (element)`
- passive - `passiveCallback (element)`
- enabled - `enabledCallback (element)`
- disabled - `enabledCallback (element)`

Note that unlike a lot of the tool's, the `element` on which the tool resides is passed to the callback, not `evt`.

For our example tool, this gives us more chances to log hello to the console:

```js
import external from './../externalModules.js';
import BaseTool from './../base/BaseTool.js';

export default class HelloWorldMouseTool extends BaseTool {
  constructor (name = 'HelloWorldMouse') {
    super({
      name,
      supportedInteractionTypes: ['mouse'],
      mixins: [
        'activeOrDisabledBinaryTool'
      ]
    });
  }

  activeCallback (element) {
    console.log(`Hello element ${element.uuid}!`);
  }

  disabledCallback (element) {
    console.log(`Goodbye element ${element.uuid}!`);
  }
}
```
