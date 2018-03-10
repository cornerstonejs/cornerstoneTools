# Tool States

Each CornerstoneTool can be in one of four states: **disabled, enabled, active, passive**. You can see a quick demo of these states in action in [this codepen](https://codepen.io/dannyrb/full/GyjEqW/), or in the [pixel probe example](https://rawgit.com/chafey/cornerstoneTools/master/examples/probe/index.html).

You set the state per tool, per enabled element. That means you can have multiple enabled canvases displaying images, with a different set of tools active in each.

> Note: examples below use a "mouseButtonTool". The API may differ slightly for tools with a different flavor of input (ie. touch tools)

### Disabled (default)

This is the default state for all tools. Tools that are disabled cannot be intereacted with and are not rendered on the enabled element.

```js
const enabledElement = document.querySelector('.my-cornerstone-canvas')

// Ex. cornerstoneTools.toolName.disable(enabledElement)
// Disables the length tool, not rendered, and cannot be interacted with
cornerstoneTools.length.disable(enabledElement)
```

### Enabled

Enabled tools will render, but will not respond to input. The "enabled" tool state is essentially a "read-only" state.

```js
const enabledElement = document.querySelector('.my-cornerstone-canvas')

// Ex. cornerstoneTools.toolName.enable(enabledElement)
// Enables the length tool, can be moved/manipulated with the left mouse button
cornerstoneTools.length.enable(enabledElement)
```

### Active

Active tools will render and respond to user input. In this state, for tools that "draw", you will be able to add new data to the canvas to add annotations and/or measurements.

```js
const LEFT_MOUSE_BUTTON = 1
const MIDDLE_MOUSE_BUTTON = 2
const RIGHT_MOUSE_BUTTON = 4
const enabledElement = document.querySelector('.my-cornerstone-canvas')

// Ex. cornerstoneTools.toolName.enable(enabledElement, mouseButtonMask, options = {})
// Activates the length tool, and binds it to the left mouse button
cornerstoneTools.length.activate(enabledElement, LEFT_MOUSE_BUTTON)
```

### Passive (Deactivated)

Passive tools will render and **_passively_** respond to user input. This means that you will be able to position and resize existing measurements and annotations, but not create new measurements and annotations.

```js
const LEFT_MOUSE_BUTTON = 1
const enabledElement = document.querySelector('.my-cornerstone-canvas')

// Ex. cornerstoneTools.toolName.enable(enabledElement, options)
// Length tool becomes passive, can be moved/manipulated with the left mouse button
cornerstoneTools.length.deactivate(enabledElement, LEFT_MOUSE_BUTTON)
```


## State Management

As you can imagine, maniging the state for all tools across many canvases can be challenging. If you want to `activate` a new tool, how do you know which already activated tools need to be `disabled`? If you want to apply/sync tool states across enabled elements, how can you?

> TODO: Basic "state store" and "state management" example


