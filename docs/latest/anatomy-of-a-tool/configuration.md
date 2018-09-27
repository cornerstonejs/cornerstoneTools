## Configuration {#configuration}

While changing a tool's mode, you also have the option of updating it's internal configuration. While tool configuration varies widely, there are a few commonly used configuration values. For example, all tools that respond to `mouse input` use `mouseButtonMask` to determine which mouse button triggers their behavior. To better understand how configuration is applied, check out the below examples:

```js
// Set's the tool's configuration to `{ mouseButtonMask: 1 }`
csTools.setToolModeActive("ToolName", { mouseButtonMask: 1 });

// Tool's options are left "as-is"
csTools.setToolModeActive("ToolName");
csTools.setToolModeActive("ToolName", null);
csTools.setToolModeActive("ToolName", undefined);
csTools.setToolModeActive("ToolName", {});

// A new key is added to the tool's configuration
csTools.setToolModeActive("ToolName", { isTouchActive: false });

//  The previous `mouseButtonMask` configuration property's value is updated to `2`
csTools.setToolModeActive("ToolName", { mouseButtonMask: 2 });
```

### Common Configuration Options

TODO: Create a property on base tool that is a string list of all configuration options used internally by the tool? Then maintain a list here that denotes what each property is used for?

| Option                      | Mouse | Touch | Annotation | Brush |
| --------------------------- | :---: | :---: | :--------: | :---: |
| `mouseButtonMask`           |   x   |       |            |       |
| `preventHandleOutsideImage` |       |       |     x      |       |
| `isTouchActive`             |       |   x   |            |       |
