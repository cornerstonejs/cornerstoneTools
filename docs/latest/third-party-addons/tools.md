## Tools {#tools}

Third party tools you must correctly extend the base class provided by `cornerstoneTools`. For instance if we wanted to package the `HelloWorldMouseTool` we made in the [Custom Tools](custom-tools/index.md) section:

```js
import * from cornerstoneTools; // Or however you you grab it within your app.

export default class HelloWorldMouseTool extends cornerstoneTools.BaseTool {
  constructor (name = 'HelloWorldMouse') {
    super({
      name,
      supportedInteractionTypes: ['mouse'],
      mixins = [
        'activeOrDisabledBinaryTool'
      ]
    });
  }

  preMouseDownCallback (evt) {
    console.log('Hello cornerstoneTools!');
  }

  activeCallback (element) {
    console.log(`Hello element ${element.uuid}!`);
  }

  disabledCallback (element) {
    console.log(`Goodbye element ${element.uuid}!`);
  }
}
```

As mixins are hooked up in the `BaseTool` constructor, you can freely add any mixins added to the list without needing to import anything. If you require mixins from a seperate plugin, you should register that plugin before registering the tool.

### Registering a Tool

You can register a tool by passing the `Class` to a cornerstoneTools instance:

```js
import HelloWorldMouseTool from './HelloWorldMouseTool.js';

const cTools = cornerstoneTools.init();

cTools.thirdParty.registerTool(HelloWorldMouseTool, 'HelloWorldMouse');


// To add the tool the in cornerstoneTools instance:
cTools.addTool(cTools.thirdParty.tools.HelloWorldMouseTool);
```

If you have a number of tools that are related, we recommend bundling them together in a [Plugin](index.md#plugins).
