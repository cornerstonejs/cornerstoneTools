## Modes {#modes}

A tool's mode (known as tool state in v2) determines how a tool is rendered, and how it can be interacted with. The four standard modes are:

| Mode               | Description                                                                                                                  |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Active             | Active tools will render and respond to user input. Active tools are able to create new annotations and/or measurements.     |
| Passive            | Passive tools will render and _passively_ respond to user input. Their data can be manipulated, but not created.             |
| Enabled            | Enabled tools will render, but will not respond to input. The "enabled" tool state is essentially a "read-only" state.       |
| Disabled (default) | The default state for a tool. Tools that are disabled cannot be interacted with and are not rendered on the enabled element. |

You can quickly test these modes out for yourself by checking out [this tool's example/demo page]() ~TODO~

### Changing a Tool's Mode

Assuming you have already [enabled one or more elements](../index.md#adding-and-using-tools) and [added tools to those elements](../index.md#adding-and-using-tools), changing an existing tool's mode can be accomplished one of two ways:

#### For All Enabled Elements

If you've added a tool with the same name to multiple enabled elements, you can update all instances of the tool by using one of the below methods:

```js
// Active
cornerstoneTools.setToolActive('ToolName', options);
// Passive
cornerstoneTools.setToolPassive('ToolName', options);
// Enabled
cornerstoneTools.setToolEnabled('ToolName', options);
// Disabled
cornerstoneTools.setToolDisabled('ToolName', options);
```

#### For a Specific Enabled Element

If you need tool behavior to differ across multiple enabled elements, you can change a tool's mode for a specific enabled element using one of the below methods:

```js
// Active
cornerstoneTools.setToolActiveForElement(
  enabledElement,
  'ToolName',
  {
    mouseButtonMask: 1,
  },
  ['Mouse']
);

// Passive
cornerstoneTools.setToolPassiveForElement(enabledElement, 'ToolName', options);
// Enabled
cornerstoneTools.setToolEnabledForElement(enabledElement, 'ToolName', options);
// Disabled
cornerstoneTools.setToolDisabledForElement(enabledElement, 'ToolName', options);
```

### Caveats

- Some tools may only be able to exist in two of the four modes. For example, the "scale overlay tool" can only be `enabled` or `disabled`. Attempts to set it to `active` will default the tool to `enabled`.
- Tools of different base types, or inherently complex tools, may bend these guidelines slightly
- 3rd party tools may not adhere to these guidelines
