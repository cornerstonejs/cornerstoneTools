## Strategies {#strategies}

Tools may optionally have multiple strategies of operation. `BaseTool`, from which all tools inherit, takes two arguments related to the tools strategies:

| Argument | Type | Description |
|----------|------|-------------|
| strategies | Object |An `Object` comprised of `function`s that take the `evt` and tool `configuration` as arguments and perform an operation.
| defaultStrategy | string | The name of the default strategy to apply. The name should be identical to a property name in `strategies`|

Upon instantiation of the tool, the `activeStrategy` is set to the `defaultStrategy`. If `defaultStrategy` is absent the first function of the `strategies` is used. The strategies mechanism is entirely optional.

`BaseTool` has the function `applyActiveStrategy (evt, this.configuration)` which will execute the `activeStrategy`, and return any value returned by the strategy.

The strategy can be changed by setting `tool.activeStrategy` to a new value. The strategy can be reset to the default by calling `setDefaultStrategy`.

 A simple example of a tool that utilizes the strategy mechanism is the `RotateTool`.
