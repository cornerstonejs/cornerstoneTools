## Base Tool {#base-tool}

The `BaseTool` is the top level parent of all tools in `cornerstoneTools`. It takes care of initializing the tool's configuration, applying mixins, and providing `@virtual` functions for mouse/touch interaction for `active` tools.

- Virtual Methods
  - preMouseDownCallback
  - postMouseDownCallback
  - preTouchStartCallback
  - postTouchStartCallback
