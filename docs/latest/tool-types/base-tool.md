## Base Tool {#base-tool}

The `BaseTool` is the top level parent of all tools in `cornerstoneTools`. It takes care of initializing the tool's configuration, applying mixins, and providing `@virtual` functions for mouse/touch interaction for `active` tools.

| Functions                   | Type                                                                                                                                             | Description                                                                                                                                                                                             |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| preMouseDownCallback(evt)  | virtual | Callback that takes priority if the tool is active, before `MOUSE_DOWN` events are processed. Does nothing by default. |
| postMouseDownCallback  | virtual | Callback that is called if the tool is active, after `MOUSE_DOWN` events are processed. Does nothing by default. |
| preTouchStartCallback | virtual | Callback that takes priority if the tool is active, before `TOUCH_START` events are processed. Does nothing by default.  |
| postTouchStartCallback | virtual | [Callback that is called if the tool is active, after `TOUCH_START` events are processed. Does nothing by default. |
