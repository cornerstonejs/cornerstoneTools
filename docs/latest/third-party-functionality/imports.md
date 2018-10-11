## Imports {#imports}


Both core and registered functionality can be retrieved by the top-level `import` function, e.g.:

```js
const evenMoreHelloWorldMixin = cornerstoneTools.import('mixins/evenMoreHelloWorld');
```

And store modules may be retrieved from the modules object:

```js
const modules = cornerstoneTools.import('store/modules');
const helloWorldModule = modules.helloWorldModule;
```
Or in a single line by using a destructuring assingment.
```js
const {helloWorldModule} = cornerstoneTools.import('store/modules');
```
