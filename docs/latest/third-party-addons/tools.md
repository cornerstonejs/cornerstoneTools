## Tools {#tools}

Third party tools you must correctly extend the base class provided by `cornerstoneTools`. For instance if we wanted to package the `HelloWorldMouseTool` we made in the [Custom Tools](custom-tools/index.md) section:

```js

class HelloWorldMouseTool extends cornerstoneTools.BaseTool {
  constructor (name = 'HelloWorldMouse') {
    super({
      name,
      supportedInteractionTypes: ['mouse'],
      mixins: [
        'activeOrDisabledBinaryTool', // Mixin from cornerstoneTools source.
        'evenMoreHelloWorld'          // Mixin from the plugin.
      ]
    });

    // Use a module from the plugin.
    this._helloWorldModule = cornerstoneTools.store.modules.helloWorld;
  }

  preMouseDownCallback (evt) {
    // Say response
    console.log(this._helloWorldModule.getters.response());

    // Mood switch
    this._helloWorldModule.setters.moodSwitch();
  }

  activeCallback (element) {
    const enabledElement = cornerstone.getEnabledElement(element);

    console.log(`Hello element ${enabledElement.uuid}!`);
  }

  disabledCallback (element) {
    const enabledElement = cornerstone.getEnabledElement(element);

    console.log(`Goodbye element ${enabledElement.uuid}!`);
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
