## Tools {#tools}

To register 3rd party tools you must correctly extend the base class provided by `cornerstoneTools`. For instance if we wanted to package the `HelloWorldMouseTool` we made in a the [Custom Tools](custom-tools/index.md) section:

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

As mixins are hooked up in the `BaseTool` constructor, you can freely add any mixins added to the list. If you require mixins from a plugin, you must register that plugin before registering the tool.

Now you may register the tool by passing the `Class` (note not an instance of the class) to a cornerstoneTools instance.

[TODO: Build whole plugin architecture first.]
