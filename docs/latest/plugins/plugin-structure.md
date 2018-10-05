## Plugin Structure {#plugin-structure}

Plugins are `Objects` with the following structure:

```js
const helloWorldPlugin = {
  //Mandatory
  name: 'helloWorldPlugin',

  // Optional
  module: helloWorldModule,
  items: [
    {
      type: 'mixins',
      name: 'evenMoreHelloWorld',
      payload: evenMoreHelloWorld
    },
    {
      type: 'tools',
      name: 'HelloWorldMouseTool',
      payload: HelloWorldMouseTool
    }
  ]
};
```

Each plugin may have `module` associated with it, which is plugged directly into the store. Plugins are currently limited to one module per plugin,
as typically any architecture that requires multiple `module`s in the store is better broken down into multiple plugins.

Each `item` in the `items` array must have the following properties:
```js
{
  type // The type of item, see below.
  name // The name of the item.
  payload // The item itself.
}
```

### Item Types

The types typically employed by plugins are:
- `base`
- `tools`
- `mixins`
- `manipulators`

The `core` library  has these additional types (a plugin could expand these, but is unlikely to):
- `drawing`
- `stateManagement`

And there is also the common `store` library access to the following:

- `state`,
- `getters`,
- `modules`,
- `setToolMode`
  - `setToolPassiveForElement`
  - `setToolActiveForElement`
  - `setToolDisabledForElement`
  - `setToolEnabledForElement`

A plugin can also define its own arbitrary `types`, should it need to.
