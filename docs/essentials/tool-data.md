# Tool Data

> This is an in-progress page. Please feel free to make suggestions or add content either directly with a pull request or in a new GitHub issue.

Tools often have data associated with them. For the most part, this data is managed for you, but it can be helpful to understand how to view and modify that data. Tool data has several traits:

- `Element`
- `ToolType`
- `StateManager (Scope)`

Most tools, when they create data... [[todo]]


## Data Events

[[todo]]

_Universal_

- Added: `cornerstonetoolsmeasurementadded`
- Modified: `cornerstonetoolsmeasurementmodified`
- Removed: `cornerstonemeasurementremoved`
- Deactivated: `cornerstonetoolstooldeactivated`

_Specific_

- `cornerstonetoolsclipstopped`
- `cornerstonestackscroll`

## Data API

**addToolState** is _mostly_ used internally by tools, or to restore a saved state. The most common API use case for this is to set the intial state when using the "Stack State Manager"

`cornerstoneTools.addToolState(element, toolType, data)`

**getToolState** is much more useful [[todo]]

`cornerstoneTools.getToolState(element, toolType)`




## Data Context (Scope)

The bulk of code around consistently managing tool properties, data, and state live in the [/src/stateManagement](https://github.com/cornerstonejs/cornerstoneTools/tree/master/src/stateManagement) folder. We've already touched on `addToolState` and `getToolState`, but we're going to take a closer look at _what happens_ when we use those methods:

- Where is the tool state data stored?
- How do multiple enabled elements share tool data?
- When would I want tool data to be shared with more than the original image it was created on?


### State Managers

To work with `addToolState` and `getToolState`, each State Manager must implement the below interface _at a minimum_.

_Interface:_

- `add(element, toolType, data)`
- `get(element, toolType)`
- Should expose a method to call `setElementToolStateManager(element, toolStateManager)`

**Image Id Specific State Manager** (Default)

This is the default context for most tools. If you attempt to `addToolState`/`getToolState` for a tool and you haven't set a different "State Manager", then [it is assumed](https://github.com/cornerstonejs/cornerstoneTools/blob/master/src/stateManagement/toolState.js#L11-L13) you want to set/get specific to the image's ID. For example, if you activate and use the length tool to measure part of an image:

`cornerstoneTools.length.activate(element, 1)`

Then any other enabled element with the length tool also activated will display the length tool's data on it's next render.

**Stack State Manager**

A Stack specific tool state management strategy. This means that tool data is shared between all imageIds in a given stack.

- `cornerstoneTools.addStackStateManager(element, otherTools)`

Here is a common use case for `addStackStateManager`:

``` js
var exampleStack = {
  currentImageIdIndex : 0,
  imageIds: [
    'example://1',
    'example://2'
  ]
};

cornerstoneTools.addStackStateManager(enabledElement, ['stack'])
cornerstoneTools.addToolState(enabledElement, 'stack', exampleStack);
```

In the above snippet, we add the "stackStateManager" for the `enabledElement` for the `stack` tool.

**Frame of Reference State Manager**

A frame-of-reference specific tool state management strategy.  This means that measurement data are tied to a specific frame of reference UID and only visible to objects using that frame-of-reference UID.

> _Needs example_

**Time Series State Manager**

- _Time Series Tool_ ( [Example](https://github.com/cornerstonejs/cornerstoneTools/blob/29182180ed3f850ba41c609b98b96464affca5f0/examples/timeSeries/index.html) | [Source](https://github.com/cornerstonejs/cornerstoneTools/blob/29182180ed3f850ba41c609b98b96464affca5f0/examples/timeSeries/index.html#L141) )
