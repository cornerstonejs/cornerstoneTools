## Imports {#imports}

Both core and registered functionality can be retrieved by the top-level `import` function, e.g.:

```js
const evenMoreHelloWorldMixin = cornerstoneTools.import(
  'mixins/evenMoreHelloWorld'
);
```

And store modules may be retrieved from the modules object of cornerstoneTools:

```js
const { helloWorldModule } = cornerstoneTools.store.modules;
```
