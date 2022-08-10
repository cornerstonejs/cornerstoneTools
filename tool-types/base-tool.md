## Base Tool {#base-tool}

The `BaseTool` is the top level parent of all Tools in Cornerstone Tools. It takes care of initializing the Tool's configuration, applying mixins, and providing `@virtual` functions for mouse/touch interaction for `Active` tools.

- Virtual Methods:
  - `preMouseDownCallback`
  - `postMouseDownCallback`
  - `preTouchStartCallback`
  - `postTouchStartCallback`

## Cursors (Optional)

Any tool may define cursors to replace the mouse cursor when active. This feature is optional. You must set the `globalConfigurationModule` option `showSVGCursors` to `true` to use them. This can be done upon initialization of `cornerstoneTools`:

```js
cornerstoneTools.init({ showSVGCursors: true });
```

A tool may implement a single cursor by setting the `svgCursor` to an [`MouseCursor` object](../modules/index.md#cursors), or by setting a set of cursors per strategy tag:

```js
// ...
cursors: {
  FILL_INSIDE: segCircleFillInsideCursor,
  FILL_OUTSIDE: segCircleFillOutsideCursor,
  ERASE_OUTSIDE: segCircleEraseOutsideCursor,
  ERASE_INSIDE: segCircleEraseInsideCursor,
},
// or
svgCursor: segCircleFillInsideCursor,
// ...
```

If you are using the _cursor-by-strategy_ method implemented by `cursors`, you do not need to set the default `svgCursor`, as `BaseTool` will do this for you.
