## Tools {#tools}

Third party tools may be easily created by `import`ing the required base tool type and extending it:

For instance if we wanted to package the `HelloWorldMouseTool` we made in the [Custom Tools](custom-tools/index.md) section into a third-party tool:

```js

const BaseTool = cornerstoneTools.import('base/BaseTool');

export default class HelloWorldMouseTool extends BaseTool {
  constructor (name = 'HelloWorldMouse') {
    super({
      name,
      supportedInteractionTypes: ['mouse'],
      mixins: [
        'activeOrDisabledBinaryTool', // Mixin from cornerstoneTools source.
        'evenMoreHelloWorld' // Mixin from the plugin.
      ]
    });

    // Use a module from the plugin. It should be added here
    const {helloWorld} = cornerstoneTools.import('store/modules');
    this._helloWorldModule = helloWorld;
  }

  // implementation ...
}
```

The array of `mixin`s to add to the tool may be from either the core library or registered functionality. You needn't import any mixin used, the heavy lifting is performed in the `constructor` of `BaseTool`.

Any other functionality imported must be done so in the constructor, to ensure it is already registered upon import (e.g. the `module` in the example above).

The tool can then be added to a cornerstoneTools instance that has the required functionality registered, e.g.:


```js
// Register all custom functionality used by cornerstoneTools in this app.
cornerstoneTools.register('module', 'helloWorldModule', myModule);
cornerstoneTools.register('mixin', 'evenMoreHelloWorld', myMixin);

// Initialise cornerstoneTools.
const cTools = cornerstoneTools.init();

// Add the custom tool!
cTools.addTool(HelloWorldMouseTool);
```
