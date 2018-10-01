## Adding Mixins {#adding-mixins}

Next you can add any mixins you wish to add the tool. These are passed to super, and initialized in `BaseTool`. For our example, our tool only makes sense in `active` or `disbled` modes, as it has none of its own data, and logs 'Hello cornerstoneTools!' on click, as such we shall include the `activeOrDisabledBinaryTool` mixin:

```js
import external from './../externalModules.js';
import BaseTool from './../base/BaseTool.js';

export default class HelloWorldMouseTool extends BaseTool {
  constructor (name = 'HelloWorldMouse') {
    super({
      name,
      supportedInteractionTypes: ['mouse'],
      mixins: [
        'activeOrDisabledBinaryTool'
      ]
    });
  }
}
```

You need not import any mixins to you're class file, this is dealt with in `BaseTool`.
