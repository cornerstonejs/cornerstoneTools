## Registration {#registration}

Registration is abstracted to a simple top-level `register` function, taking `type`, `name` and `item` as arguments e.g.:

```js
cornerstoneTools.register('module', 'helloWorldModule', myModule);
cornerstoneTools.register('mixin', 'evenMoreHelloWorld', myMixin);
```

By default, trying to register an item that would occupy an already registered 'type/name' `uri` will log a warning and cancel registration. If you wish to overwrite a uri, you may do so by adding `true` to the end of the register call:

```js
cornerstoneTools.register('mixin', 'evenMoreHelloWorld', mySuperiorMixin, true);
```

If a library has lots of items it would like to register at once, it can pack its items into an array such as:

```js
const lotsOfItems = [
  {
    type, // String
    name, // String
    item  // Object/Function
  },
  // Etc...
];
```

These can then all be registered at once by calling:

```js
cornerstoneTools.registerSome(lotsOfItems);
```

Again, you can toggle an overwrite by adding `true` as an additional argument:

```js
cornerstoneTools.registerSome(lotsOfItems, true);
```
