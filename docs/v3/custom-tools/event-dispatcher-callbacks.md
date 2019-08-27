## Event Dispatcher Callbacks {#event-dispatcher-callbacks}

Here we can add the meat of our Tool. Event dispatchers check for methods on Tools and fire them when appropriate.

> TODO: List them all?? Or just link to api? Not sure yet.
> TODO: An actual useful description.

For our Tool we want to log to the console on mouse click. `BaseTool` has two appropriate methods: `preMouseDownCallback` and `postMouseDownCallback`. These fire before or after other annotation data on the canvas has a chance to claim the mouse click. for our Tool we shall choose `preMouseDownCallback`, as it's always nice to say hello before doing anything else. The method can simply be defined and it shall be called when appropriate via the `mouseToolEventDispatcher`:

```js
import csTools from 'cornerstone-tools';
const BaseTool = csTools.import('base/BaseTool');

export default class HelloWorldTool extends BaseTool {
  constructor(name = 'HelloWorld') {
    super({
      name,
      supportedInteractionTypes: ['Mouse'],
      mixins: ['activeOrDisabledBinaryTool'],
    });
  }

  preMouseDownCallback(evt) {
    console.log('Hello cornerstoneTools!');
  }

  activeCallback(element) {
    console.log(`Hello element ${element.uuid}!`);
  }

  disabledCallback(element) {
    console.log(`Goodbye element ${element.uuid}!`);
  }
}
```
