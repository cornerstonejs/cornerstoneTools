## Cross Plugin Dependencies {#cross-plugin-dependencies}

Plugins in one tool may depend on functionality from other plugins, so long as the functionality is imported from within the tool's constructor, e.g.:

```js
class DependencyTool extends BaseTool {
  constructor (name = 'Dependency') {
    super({
      name,
      supportedInteractionTypes: ['mouse', 'touch'],
      // Apply mixin from a different plugin.
      mixins: [
        'someOtherPlugin/theirMixin'
      ]
    });

    // Add a manipulator from a different plugin for later use.
    this._theirManipulator = cornerstoneTools.import('someOtherPlugin/manipulators/thierManipulator');
  }
}
```

It is currently not possible to extend tools from other plugins, but this might be possible in the future version of `cornerstoneTools`.
