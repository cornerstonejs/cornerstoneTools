## Imports {#imports}

Helpful internal library methods and utilities can be retrieved by the top-level `importInternal` function, e.g.:

```js
const evenMoreHelloWorldMixin = cornerstoneTools.importInternal(
  'mixins/evenMoreHelloWorld'
);
```

You can add to the list of methods and utilities that can be retrieved by [registering them](#registration).

Store modules may also be retrieved with the top-level `getModule` function:

```js
const { helloWorldModule } = cornerstoneTools.getModule('helloWorldModule');
```
