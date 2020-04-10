## Item Types {#item-types}

The types typically registered by third-parties are:

- `base`
- `mixins`
- `manipulators`
- `utils`

Cornerstone Tools has these additional types (third-parties could expand these, but are unlikely to):

- `drawing` (for drawing api functions)
- `stateManagement`

Additionally, custom `module`s can be added to the `store`.

### Base

A user can define a new `abstract` base Tool type, from which third-party Tools can inherit from. The new Tool type must inherit from either `BaseTool`, `BaseAnnotationTool` or `BaseBrushTool`. To create a new base Tool type simply [`import`](index.md#imports) the base type you wish to extend and extend it as:

```js
const BaseTool = cornerstoneTools.import('core/base/BaseTool');

export default class BaseNewTypeTool extends BaseTool {
  // implementation ...
}
```

### Mixins

You may want to make custom `mixin`s if you re-use some functionality between various custom Tools. Mixins are simply `Object`s consisting of `function`s that may assigned to any Tool as member functions, e.g.:

```js
function evenMoreHelloWorld() {
  // Note this would need to be called from somewhere
  // Within the Tool's implementation.
  console.log('Hello World from the even more hello world mixin!');
}

export default {
  evenMoreHelloWorld,
};
```

### Manipulators

`BaseAnnotationTool`s use `manipulators` to interact with the annotation's `handle`s data in a particular way. If you need to build a custom interaction mechanism you envision using more than once, you may want to make a custom manipulator. A manipulator is just a `function`. They have rather freeform structure, but principally take `eventData` and `toolData` and perform an operation, e.g.:

```js
export default function(eventData, toolName, data, handle, someCallback) {
  // Implementation, Do something with the handle.
  // ...
  someCallback();
}
```

### Utils

`Utils` are just functions that perform some generic common process, e.g.:

```js
export default function() {
  console.log('Super important hello world util.');
}
```

### Modules

A module is a namespaced storage object in the `store` that contains the following properties:

| Property                                      | Requirement | Description                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| state                                         | Mandatory   | An object that stores the module's current state. There is no vigorous structure your state must follow, and you may structure it however you wish. We recommend as many top level primitives as possible, however getters can be used for more complicated queries.                                                                                                 |
| getters                                       | Optional    | An object comprised of functions that query state. Getters can be used for more complex queries of the state (e.g. to yield a value that references a specific `cornerstone` enabled element). Top level primitives that require no calculation should instead by accessed by `const property = state.property`, as this reduces boilerplate in implementation code. |
| setters                                       | Optional    | An object comprised of functions that modify state. Setters can be used for more complex input (e.g. `push` object `x` to array `y`). Top level primitives should be set by `state.property = value`, as this reduces boilerplate in implementation code.                                                                                                            |
| onRegisterCallback (name)                     | Optional    | This function is called when the module is registered to the `cornerstoneTools` `store`. It is used to perform any global initialization the modules requires. The `name` the module was given upon registration is passed to the callback.                                                                                                                          |
| enabledElementCallback (enabledElement)       | Optional    | This function is called once for each `Enabled` element upon registering the module, and again any time a new `Enabled` element is added to the `cornerstoneTools` instance. The `Enabled` Element is passed to the callback.                                                                                                                                        |
| removeEnabledElementCallback (enabledElement) | Optional    | This function is called whenever an `Enabled` element is removed from the `cornerstoneTools` instance, allowing cleanup of unneeded data. The `Enabled` Element is passed to the callback.                                                                                                                                                                           |

Most modules will have getters and setters, unless they only contain primitives (e.g. the module's state is only comprised of `boolean` toggles). Here is a simple toy example of a module with state, setters and getters:

```js
const state = {
  isPolite: true,
  responses: {
    polite: 'Hello World!',
    rude: 'Go away, World.',
  },
};

const setters = {
  politeResponse: response => {
    state.responses.polite = response;
  },
  rudeResponse: response => {
    state.responses.rude = response;
  },
  moodSwitch: () => {
    state.isPolite = !state.isPolite;
  },
};

const getters = {
  response: () => {
    if (state.isPolite) {
      return state.responses.polite;
    } else {
      return state.responses.rude;
    }
  },
};

function onRegisterCallback() {
  console.log('Hello onRegisterCallback.');
}

function enabledElementCallback(enabledElement) {
  console.log(`hello element ${enabledElement.uuid}.`);
}

export default {
  state,
  getters,
  setters,
  onRegisterCallback,
  enabledElementCallback,
};
```

A more complete and realistic example of a module including both optional callbacks can be found in `src/store/modules/segmentationModule.js`.
