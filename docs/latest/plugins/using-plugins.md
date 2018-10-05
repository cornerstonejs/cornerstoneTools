## Using Plugins {#using-plugins}

Once a library has been registered, you may import a single item like so:

```js
const evenMorHelloWorld = cornerstoneTools.import('helloWorldPlugin/mixins/evenMoreHelloWorld');
```

You can also import the whole library as an object, or a object containing all the elements of a certain type:
```js
// The whole plugin as an Object.
const helloWorldPlugin = cornerstoneTools.import('helloWorldPlugin');
// All mixins from the helloWorldPlugin as an Object:
const helloWorldMixins = cornerstoneTools.import('helloWorldPlugins/mixins');

```


### Modules

Modules are plugged straight into the store, so they may be accessed directly the `cornerstoneTools` instance:

```js
const helloWorldModule = cToolsInstance.store.modules.helloWorldModule;
```

### Tools

Third-Party Tools can easily be added to `cornerstone` `enabledElement`s:

```js
const HelloWorldMouseTool = cTools.import('helloWorldPlugin/tools/HelloWorldMouseTool');

cTools.addTool(HelloWorldMouseTool);
```


### Mixins

Mixins are assigned in `BaseTool`, so that you may freely add any `mixin`s to your `tool`s without needing to import anything.

Mixins from the `core` library and third party libraries may be included in the constructor arguments as follows:

```js
mixins = [
  `core/mixins/enabledOrDisabledBinaryTool` // A core mixin
  `helloWorldPlugin/mixins/evenMoreHelloWorldMixin` // A  mixin from a plugin
]
```

The mixin loader in `BaseTool` is clever enough that the `mixins` type is optional, and you may instead write:

```js
mixins = [
  `core/enabledOrDisabledBinaryTool`
  `helloWorldPlugin/evenMoreHelloWorldMixin`
]
```

Additionally, if the namespace is removed entirely, `BaseTool` will assume the mixin belongs to the core library:

```js
mixins = [
  `enabledOrDisabledBinaryTool`
  `helloWorldPlugin/evenMoreHelloWorldMixin`
]
```

All of the above are valid, feel free to be verbose or use the shorthand arguments as you see fit.


### Manipulators

Manipulators may be attached to your `tool` upon instantiation, as follows:

```js
class ExampleTool extends BaseTool {
    constructor (name = 'Example') {
      super({
        name,
        supportedInteractionTypes: ['mouse', 'touch'],
      });

      this._myManipulator = cornerstoneTools.import('core/manipulators/getHandleNearImagePoint');
    }
  }

```

They can then be accessed throughout the `tool`'s implementation.
