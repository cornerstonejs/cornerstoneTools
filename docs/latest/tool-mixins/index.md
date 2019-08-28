# Tool Mixins

Tool Mixins are ways to construct tools via composition using reusable components. In a mixin may include a set of methods which are applied to the class upon instantiation. You can register a mixin by its name in your tool without needing to import it (as this is dealt with inside `BaseTool`). For example:

```js
export default class FreehandRoiSculptorTool extends BaseTool {
  constructor(props = {}) {
    const defaultProps = {
      // ...
      mixins: ['activeOrDisabledBinaryTool'],
      // ...
    };
    //...
  }
  //...
}
```

By adding the mixin to the list of `mixins` in the default props, it becomes a core feature of the tool. It is possible, however, to pass a mixin at runtime upon class instantiation to alter the behaviour of the resulting tool.

Mixins have one optional special method `initilizeMixin`. If the `intializeMixin` method is present in a mixin, it will be called once when the mixin is attached to the tool.

{% include "./binary-tools.md" %}
{% include "./segmentation-mixins.md" %}
