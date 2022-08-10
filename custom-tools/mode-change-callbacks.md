## Mode Change Callbacks {#mode-change-callbacks}

In the Cornerstone Tools framework, if a Tool changes [mode](../anatomy-of-a-tool/index.md#modes), an appropriate callback is called if the Tool has one. These are, quite simply:

- `Active` - `activeCallback (element)`
- `Passive` - `passiveCallback (element)`
- `Enabled` - `enabledCallback (element)`
- `Disabled` - `enabledCallback (element)`

Note that unlike a lot of the callbacks, the `element` on which the Tool resides is passed to the mode change callbacks, not `evt`.

For our example Tool, this gives us more chances to log hello to the console:

```js
import csTools from 'cornerstone-tools';
const BaseTool = csTools.importInternal('base/BaseTool');

export default class HelloWorldTool extends BaseTool {
  constructor(name = 'HelloWorld') {
    super({
      name,
      supportedInteractionTypes: ['Mouse'],
      mixins: ['activeOrDisabledBinaryTool'],
    });
  }

  activeCallback(element) {
    console.log(`Hello element ${element.uuid}!`);
  }

  disabledCallback(element) {
    console.log(`Goodbye element ${element.uuid}!`);
  }
}
```
