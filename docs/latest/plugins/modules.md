## Store Modules {#modules}

A store module is a namespaced storage object in the `store` that contains the following properties:

| Property | Requirement | Description |
| --- | ---- |
| state | Mandatory | An object that stores the module's current state. There is no vigorous structure your state must follow, and you may structure it however you wish. We recommend as many top level primitives as possible, however getters can be used for more complicated queries.|
| getters | Optional | An object comprised of functions that query state. Getters can be used for more complex queries of the state (e.g. to yield a value that references a specific `cornerstone` enabled element). Top level primitives that require no calculation should instead by accessed by `const property = state.property`, as this reduces boilerplate in implementation code. |
| setters | Optional | An object comprised of functions that modify state. Setters can be used for more complex input (e.g. `push` object `x` to array `y`). Top level primitives should be set by `state.property = value`, as this reduces boilerplate in implementation code. |
| onRegisterCallback (name) | Optional | This function is called when the module is registered to the `cornerstoneTools` `store`. It is used to perform any global initialization the modules requires. The `name` the module was given upon registration is passed to the callback. |
| enabledElementCallback (enabledElement) | Optional | This function is called once for each `enabledElement` upon registering the module, and again any time a new `enabledElement` is added to the `cornerstoneTools` instance. The `enabledElement` is passed to the callback.|

Most modules will have getters and setters, unless they only contain primitives (e.g. the modules state is only comprised of `boolean` toggles).

### Creating a 3rd party module

Here is a simple toy example of a module with state, setters and getters:

```js
// helloWorldModule.js

const state = {
  isPolite: true
  responses: {
    polite: 'Hello World!',
    rude: 'Go away, World.'
  }
};

const setters = {
  politeResponse: (response) => {
    state.responses.polite = response;
  },
  rudeResponse: (response) => {
    state.responses.rude = response;
  }
};

const getters = {
  response: () => {
    if (state.isPolite) {
      return state.responses.polite;
    } else {
      return state.response.rude;
    }
  }
}

function onRegisterCallback () {
  console.log('Hello onRegisterCallback.');
}

function enabledElementCallback (enabledElement) {
  console.log(`hello element ${enabledElement.uuid}.`)
}

export default {
  state,
  getters,
  setters,
  onRegisterCallback,
  enabledElementCallback
};
```

A more complete and realistic example of a module including both optional callbacks can be found in `src/store/modules/brushModule.js`.

### Registering a 3rd party module

Once you have built your module you need to register it. For 3rd party modules you can do this after you initialize `cornerstoneTools`, as follows.

```js
import helloWorldModule from './helloWorldModule.js';

const cTools = cornerstoneTools.init();

cTools.store.registerModule(helloWorldModule, 'helloWorld');
```

The `registerModule` function takes two arguments, the module itself, and the name for it to be referenced by. Once registered, `onRegisterCallback` is called once, followed by `enabledElementCallback` for each enabled element.

The module can then be accessed by `cTools.store.helloWorld`.
