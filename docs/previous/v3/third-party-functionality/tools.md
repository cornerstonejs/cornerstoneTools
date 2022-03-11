## Tools {#tools}

Third-party tools may be easily created by `import`ing the required base tool Type and extending it.

For instance, if we wanted to package the `HelloWorldTool` we made in the [Custom Tools](custom-tools/index.md) section into a third-party tool:

```js
const BaseTool = cornerstoneTools.import('base/BaseTool');

export default class HelloWorldTool extends BaseTool {
  constructor(name = 'HelloWorld') {
    super({
      name,
      supportedInteractionTypes: ['mouse'],
      mixins: [
        'activeOrDisabledBinaryTool', // Mixin from cornerstoneTools source.
        'evenMoreHelloWorld', // Mixin from the plugin.
      ],
    });

    // Use a module from the plugin. It should be first accessed in constructor.
    this._helloWorldModule = cornerstoneTools.store.modules.helloWorld;
  }

  // implementation ...
}
```

The array of mixins to add to the Tool may be from either the core library or registered functionality. You needn't import any mixin used, the heavy lifting is performed in the `constructor` of `BaseTool`.

Any other functionality imported must be done so in the constructor, to ensure it is already registered upon import. This includes accessing modules which might not be there when the file is loaded (e.g. the example above).

The tool can then be added to a `cornerstoneTools` instance that has the required functionality registered, e.g.:

```js
// Register all custom functionality used by cornerstoneTools in this app.
cornerstoneTools.register('module', 'helloWorldModule', myModule);
cornerstoneTools.register('mixin', 'evenMoreHelloWorld', myMixin);

// Initialise cornerstoneTools.
cornerstoneTools.init();

// Add the custom tool!
cornerstoneTools.addTool(HelloWorldMouseTool);
```
