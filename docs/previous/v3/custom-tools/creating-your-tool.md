## Creating Your Tool {#creating-your-tool}

Once you have an appropriate base class chosen (we will use the `BaseTool` in this example), you can extend it to start building your Tool. In this example we shall make a Tool that logs `'Hello cornerstoneTools!'` to the console on every mouse click.

### Class Definition

By convention the class name should be in PascalCase, and suffixed with `Tool`.
For example we shall call our wonderful tool `HelloWorldTool`:

```js
import csTools from 'cornerstone-tools';
const BaseTool = csTools.import('base/BaseTool');
// NOTE: if you're creating a tool inside the CornerstoneTools repository
// you can import BaseTool directly from `src/tools/base`.

export default class HelloWorldTool extends BaseTool {
  constructor(name = 'HelloWorld') {
    super({
      name,
      supportedInteractionTypes: ['Mouse'],
    });
  }
}
```

The constructor must call `super()`, which passes an object to the constructor of the superclass (`BaseTool`, in this case, but the same object is passed to `BaseAnnotationTool` or `BaseBrushTool`). The object passed may have the following properties:

| Property                                               | Requirement | description                                                                                                                                             |
| ------------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name                                                   | Mandatory   | The name of the Tool.                                                                                                                                   |
| supportedInteractionTypes                              | Mandatory   | An array of strings listing the interaction types, `mouse` and/or `touch`.                                                                              |
| [strategies](../anatomy-of-a-tool/index.md#strategies) | Optional    | If your Tool has multiple strategies of operation, you may pass an array of functions for each strategy here (see the `RotateTool` for a good example). |
| defaultStrategy                                        | Optional    | If you have multiple strategies, this one should be used by default (pass a string identical to the strategy function name).                            |
| configuration                                          | Optional    | An object with configurable properties used by your Tool. It may include your Tool's sensitivity, how an annotation displays when rendered, etc.        |
| [mixins](../anatomy-of-a-tool/index.md#mixins)         | Optional    | An array of mixins (commonly used behaviours/functionality) to add to the Tool.                                                                         |

For our simple Tool we pass only the two mandatory fields to `super`. For the Tool's own constructor, it must at minimum take `name` as a parameter, and it must have a default value. By convention the default name is the same as the classname, minus the `Tool` suffix.
