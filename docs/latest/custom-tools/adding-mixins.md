## Adding Mixins {#adding-mixins}

Next you can add any [mixins](../anatomy-of-a-tool/index.md#mixins) you wish to add the Tool. These are passed to `super`, and initialized in `BaseTool`. For our example, our Tool only makes sense in `Active` or `Disabled` modes, as it has none of its own data, and logs `'Hello cornerstoneTools!'` on click, as such we shall include the `activeOrDisabledBinaryTool` mixin:

```js
import csTools from 'cornerstone-tools';
const BaseTool = csTools.import('base/BaseTool');

export default class HelloWorldMouseTool extends BaseTool {
  constructor(name = 'HelloWorldMouse') {
    super({
      name,
      supportedInteractionTypes: ['Mouse'],
      mixins: ['activeOrDisabledBinaryTool'],
    });
  }
}
```

You need not import any mixins to your class file; this is dealt with in `BaseTool`.
