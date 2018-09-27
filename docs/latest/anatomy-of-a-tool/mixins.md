## Mixins (Behaviours) {#mixins}

Mixins are a set of member functions that can be added to a tool upon instantiation, giving it additional behavior. Mixins are stored in the top level `src/mixins` directory.

### Adding a mixin to a tool

Mixins can be added to a tool by passing an array to the `mixins` argument of its constructor. Each element of the array must be a string containing the name of the mixin you wish to apply.

For example, if a tool only makes sense to be enabled/disabled, you can give it the `enabledOrDisabledBinaryTool`:

```js
export default class ExampleOverlayTool extends BaseTool {
  // Pass an array of mixins to the constructor.
  constructor(
    name = "ExampleOverlay",
    mixins = ["enabledOrDisabledBinaryTool"]
  ) {
    // Pass mixins to 'super' so that BaseTool's
    // Constructor can attach it to the class.
    super({
      name,
      mixins
    });
  }
}
```

Thanks to this mixin, the tool's mode will now switch to `enabled` when set `active`, and to `disabled` when set `passive`.

### Registering a new mixin

To create a new mixin, create a new file in the `mixins` directory that contains some functions and a `export`s a `default` object containing these functions, e.g.:

```js
// mixins/helloTool.js

function helloTool() {
  console.log("Hello Tool!");
}

export default {
  helloTool
};
```

Then register the mixin in `mixins/index.js`, which will allow it to be attached to a tool through the `mixins` argument of its constructor:

```js
// mixins/index.js

// Other imports
import helloTool from "./helloTool.js";

export default {
  // Other registered functions...
  helloTool
};
```
