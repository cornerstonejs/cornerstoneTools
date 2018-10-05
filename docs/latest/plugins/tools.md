## Tools {#tools}

Third party tools you must correctly extend the base class provided by `cornerstoneTools`. For instance if we wanted to package the `HelloWorldMouseTool` we made in the [Custom Tools](custom-tools/index.md) section:

```js

const BaseTool = cornerstoneTools.import('core/base/BaseTool');
const modules = cTools.store.modules;

export default class HelloWorldMouseTool extends BaseTool {
  constructor (name = 'HelloWorldMouse') {
    super({
      name,
      supportedInteractionTypes: ['mouse'],
      mixins: [
        'core/mixins/activeOrDisabledBinaryTool', // Mixin from cornerstoneTools source.
        'hellowWorldPlugin/mixins/evenMoreHelloWorld' // Mixin from the plugin.
      ]
    });

    // Use a module from the plugin.
    this._helloWorldModule = modules.helloWorld;
  }

  // implementation ...
}
```
