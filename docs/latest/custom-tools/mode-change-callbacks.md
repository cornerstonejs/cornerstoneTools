## Mode Change Callbacks {#mode-change-callbacks}

In the Cornerstone Tools framework, if a Tool changes [mode](../anatomy-of-a-tool/index.md#modes), an appropriate callback is called if the Tool has one. These are, quite simply:

- `Active` - `activeCallback (element)`
- `Passive` - `passiveCallback (element)`
- `Enabled` - `enabledCallback (element)`
- `Disabled` - `enabledCallback (element)`

Note that unlike a lot of the Tools, the `element` on which the Tool resides is passed to the callback, not `evt`.

For our example Tool, this gives us more chances to log hello to the console:

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
