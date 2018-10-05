## Mixins {#mixins}

You may want to make third party [mixins](../tool-mixins/index.md) if you reuse some functionality between tools in your plugin. If you want to use functionality from within `cornerstoneTools` you can import these, but not all useful functions are exposed at usable way at the top level yet. More flexible support will come in the future. Mixins are simply an object consisting of functions that may be included as member functions to any tool:

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
