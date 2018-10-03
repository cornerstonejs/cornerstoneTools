## Mixins {#mixins}

Third party [mixins](../tool-mixins/index.md) are currently limited in scope. If you want to use functionality from within `cornerstoneTools` you can import these, but not all useful functions are exposed at usable way at the top level yet. More flexible support will come in the future. Mixins are simply an object consisting of functions that may be included as member functions to any tool:

```js
function evenMoreHelloWorldMixin () {
  // Note this would need to be called from somewhere
  // Within the tool's implementation.
  console.log('Hello World from the even more hello world mixin!');
}

export default {
  evenMoreHelloWorld
};
```

### Registering a Mixin

Now you may register the tool by passing the `Class` to a cornerstoneTools instance:

```js
import evenMoreHelloWorldMixin from './evenMoreHelloWorldMixin.js';

const cTools = cornerstoneTools.init();

cTools.thirdParty.registerMixin(evenMoreHelloWorldMixin, 'evenMoreHelloWorld');
```

If you have a number of tools that utilise your mixin, we recommend bundling them together in a [Plugin](index.md#plugins).
