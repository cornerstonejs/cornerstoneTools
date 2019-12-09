## Base Tool {#base-tool}

The `BaseTool` is the top level parent of all Tools in Cornerstone Tools. It takes care of initializing the Tool's configuration, applying mixins, and providing `@virtual` functions for mouse/touch interaction for `Active` tools.

- Virtual Methods:
  - `preMouseDownCallback`
  - `postMouseDownCallback`
  - `preTouchStartCallback`
  - `postTouchStartCallback`
