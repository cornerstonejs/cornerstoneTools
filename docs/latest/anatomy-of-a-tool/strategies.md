## Strategies {#strategies}

Tools may optionally have multiple strategies of operation. [`BaseTool`](../tool-types/index.md#base-tool), from which all Tools inherit, takes two arguments related to the Tools strategies:

| Argument | Type | Description |
|----------|------|-------------|
| strategies | Object |An `Object` comprised of `function`s that take the `evt` and Tool `configuration` as arguments and perform an operation.
| defaultStrategy | string | The name of the default strategy to apply. The name should be identical to a property name in `strategies`.|

Upon instantiation of the Tool, the `activeStrategy` is set to the `defaultStrategy`. If `defaultStrategy` is absent, the first function of the `strategies` is used. The strategies mechanism is entirely optional.

`BaseTool` has the function `applyActiveStrategy (evt, this.configuration)` which will execute the `activeStrategy`, and return any value returned by the strategy.

The strategy can be changed by setting `tool.activeStrategy` to a new value. The strategy can be reset to the default by calling `setDefaultStrategy`.

A simple example of a Tool that utilizes the strategy mechanism is the [`rotate` Tool](https://github.com/cornerstonejs/cornerstoneTools/blob/master/src/tools/RotateTool.js).
