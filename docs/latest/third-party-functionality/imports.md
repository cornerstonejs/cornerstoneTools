## Imports {#imports}

Helpful internal library methods and utilities can be retrieved by the top-level `importInternalModule` function, e.g.:

```js
const evenMoreHelloWorldMixin = cornerstoneTools.importInternalModule(
  'mixins/evenMoreHelloWorld'
);
```

You can add to the list of methods and utilities that can be retrieved by [registering them](#registration).

And store modules may be retrieved from the modules object of cornerstoneTools:

```js
const { helloWorldModule } = cornerstoneTools.store.modules;
```
