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

`Module` are objects that store global data, which may be shared between multiple tools, effect multiple cornerstone elements, etc. Most modules will have getters and setters, unless they only contain primitives (e.g. the module's state is only comprised of `boolean` toggles). You can learn more about modules [here](../modules/index.md). Here is a simple toy example of a module with state, setters and getters:

```js
const configuration = {
  // Some app-level configuration for this module.
};

// The modules internal state.
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
