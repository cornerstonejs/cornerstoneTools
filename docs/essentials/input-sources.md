# Input Sources

Cornerstone Tools provides support for a number of input sources which can be used to create interactive tools.

Currently, we provide four input sources: **mouse**, **mouseWheel**, **touch**, and **keyboard**. Each of these input sources triggers a number of events which can be used by tools. This section will explain the events triggered by each of these input sources.

### Common Event Data

Each of the input types triggers separate events for use by tools. The following properties are common to all events:

Property | Type | Meaning
------------ | ------------- | -------------
event | [Event](https://developer.mozilla.org/en-US/docs/Web/API/Event) | The original browser event which caused the Cornerstone Tools event to be fired.
element | [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element) | The DOM Element for the Cornerstone Enabled Element which is the target of this event.
viewport | Viewport | The Cornerstone Viewport object for the specific Enabled Element at the time the event was fired.
image | Image | The Cornerstone Image object for the specific Enabled Element at the time the event was fired.
type | String | [Event.type](https://developer.mozilla.org/en-US/docs/Web/API/Event/type)

#### Coordinates

Coordinates are currently represented as:

````
Object {
  page:   { x: Number, y: Number },
  image:  { x: Number, y: Number },
  client: { x: Number, y: Number },
  canvas: { x: Number, y: Number }
}
````


### Mouse Input Source

The mouse input source triggers the following events:

Event Name | Meaning
------------ | -------------
**cornerstonetoolsmousedown** | ** Mouse Down ** <br> This is fired from the browser's [**mousedown**](https://developer.mozilla.org/en-US/docs/Web/Events/mousedown) event.
**cornerstonetoolsmouseup** | ** Mouse Up ** <br> This is fired from the browser's [**mouseup**](https://developer.mozilla.org/en-US/docs/Web/Events/mouseup) event.
**cornerstonetoolsmousedownactivate** | Mouse Down, and no tool is present at the current location to respond to the event.
**cornerstonetoolsmousedrag** | ** Mouse move while mouse button held down **
**cornerstonetoolsmousemove** | ** Mouse move without mouse button held down **
**cornerstonetoolsmouseclick** | ** Mouse Click **
**cornerstonetoolsmousedoubleclick** | Two mouse clicks in quick succession. This is fired from the browser's [**dblclick**](https://developer.mozilla.org/en-US/docs/Web/Events/dblclick) event.
**cornerstonetoolsmouserightclick** | ** Mouse right click **

#### Event Data
The mouse input events include the following event data:

Property | Type | Meaning
------------ | ------------- | -------------
which | Number | The jQuery 'which' value for the mouse buttons which were held down when the event occurred. These are computed from the [event.buttons](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons) values [here](https://github.com/cornerstonejs/cornerstoneTools/blob/c9807489e5085f7a6720dd7e5943028aad747516/src/inputSources/mouseInput.js#L11). In future iterations (possibly 3.0) of Cornerstone Tools, we plan to deprecate the 'which' value in favour of the 'buttons' value.
startPoints | Cornerstone Coordinates | The starting coordinates for the mouse event (e.g., for a cornerstonetoolsmousemove event, this is the location where the initial mouseDown event started).
currentPoints | Cornerstone Coordinates | The current coordinates
lastPoints | Cornerstone Coordinates | The final coordinates
deltaPoints | Cornerstone Coordinates | The change in coordinates
ctrlKey | Boolean | [MouseEvent.ctrlKey](https://developer.mozilla.org/fr/docs/Web/API/MouseEvent/ctrlKey)
metaKey | Boolean | [MouseEvent.metaKey](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/metaKey)
shiftKey | Boolean | [MouseEvent.shiftKey](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/shiftKey)

**Note**: ctrlKey, metaKey, and shiftKey are only currently included in eventData for **cornerstonetoolsmousemove** events.

#### Usage
```js
const element = document.querySelector('.my-cornerstone-element');
// Enable mouse input
cornerstoneTools.mouseInput.enable(element);

// Disable mouse input
cornerstoneTools.mouseInput.disable(element);
```

### MouseWheel Input Source
The mouse input source triggers the following events:

Event Name | Meaning
------------ | -------------
**cornerstonetoolsmousewheel** | ** Mouse Wheel ** <br> This is fired from the browser's [**mousewheel**](https://developer.mozilla.org/en-US/docs/Web/Events/mousewheel) event.

#### Event Data
The **cornerstonetoolsmousewheel** event includes the following event data:

Property | Type | Meaning
------------ | ------------- | -------------
pageX | Number | [pageX](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/pageX)
pageY | Number | [pageX](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/pageY)
imageX | Number | The X (horizontal) coordinate (**in image pixels**) at which the mouse was clicked, relative to the left edge of the image.
imageY | Number | The Y (vertical) coordinate (**in image pixels**) at which the mouse was clicked, relative to the top of the image.
direction | Number | -1 to represent negative 'wheelDelta', +1 to represent positive 'wheelDelta'

#### Usage

```js
const element = document.querySelector('.my-cornerstone-element');

// Enable mouse wheel input
cornerstoneTools.mouseWheelInput.enable(element);

// Disable mouse wheel input
cornerstoneTools.mouseWheelInput.disable(element);
```

### Touch Input Source

The touch input source triggers the following events:

Event Name | Meaning
------------ | -------------
**cornerstonetoolstouchstart** | ** Touch Start ** <br> This is fired from the browser's [**touchstart**](https://developer.mozilla.org/en-US/docs/Web/Events/touchstart) event.
**cornerstonetoolstouchend** | ** Touch End ** <br> This is fired from the browser's [**touchend**](https://developer.mozilla.org/en-US/docs/Web/Events/touchend) event.
**cornerstonetoolstouchactive** | Mouse Down, and no tool is present at the current location to respond to the event. **Note:** Needs to be renamed to cornerstonetoolstouchactivate
**cornerstonetoolstouchdrag** | ** Touch Move ** <br> This is fired from the browser's [**touchend**](https://developer.mozilla.org/en-US/docs/Web/Events/touchmove) event.
**cornerstonetoolstouchdragend** | ** Dragging has stopped ** <br> This is fired from the Hammer.js [panend](http://hammerjs.github.io/recognizer-pan/) event.
**cornerstonetoolstouchpinch** | ** Pinch ** <br> This is fired from the Hammer.js [pinchmove](http://hammerjs.github.io/recognizer-pinch/) event.
**cornerstonetoolstouchrotate** | ** Rotation ** <br> This is fired from the Hammer.js [rotatemove](http://hammerjs.github.io/recognizer-rotate/) event.
**cornerstonetoolstouchpress** | ** Long press on a location without significant movement **
**cornerstonetoolstap** | ** Quick [tap](http://hammerjs.github.io/recognizer-tap/) on a location **
**cornerstonetoolsdoubletap** | ** Two [taps](http://hammerjs.github.io/recognizer-tap/) in quick succession **
**cornerstonetoolsmultitouchstart** | Equivalent to **cornerstonetoolstouchstart**, but fired if there are multiple pointers on screen.
**cornerstonetoolsmultitouchstartactive** | Equivalent to **cornerstonetoolstouchactive**, but fired if there are multiple pointers on screen.
**cornerstonetoolsmultitouchdrag** | Equivalent to **cornerstonetoolstouchdrag**, but fired if there are multiple pointers on screen.

#### Event Data
The touch input events include the following event data:

Property | Type | Meaning
------------ | ------------- | -------------
currentPoints | Cornerstone Coordinates | The current coordinates
lastPoints | Cornerstone Coordinates | The final coordinates
deltaPoints | Cornerstone Coordinates | The change in coordinates
isTouchEvent | Boolean | Always present and always True for touch events. This property is being used in certain tools to change behaviour depending on whether or not the input event is a touch event.
direction | Number | For **cornerstonetoolstouchpinch** events, this is -1 for "pinchout" and +1 for 'pinchin'.
scale | Number | For **cornerstonetoolstouchpinch** events, the ratio of change in the [scale](http://hammerjs.github.io/api/#event-object) ((current - previous) / previous) for a 'pinchmove' sourced event.
numPointers | Number | For multi-touch events, this is the number of pointers which were touching the screen while this event was fired.
rotation | Number | For **cornerstonetoolstouchrotate** events, this is the [rotation](http://hammerjs.github.io/api/#event-object) (in degrees) that has been performed.

#### Usage
```js
const element = document.querySelector('.my-cornerstone-element');

// Enable touch input
cornerstoneTools.touchInput.enable(element);

// Disable touch input
cornerstoneTools.touchInput.disable(element);
```

### Keyboard Input Source

The keyboard input source triggers the following events:

Event Name | Meaning
------------ | -------------
**cornerstonetoolskeydown** | This is fired from the browser's [[keydown](https://developer.mozilla.org/en-US/docs/Web/Events/keydown) event.
**cornerstonetoolskeyup** | This is fired from the browser's [[keyup](https://developer.mozilla.org/en-US/docs/Web/Events/keyup) event.
**cornerstonetoolskeypress** | This is fired from the browser's [[keypress](https://developer.mozilla.org/en-US/docs/Web/Events/keypress) event.

#### Event Data
The keyboard input events include the following event data:

Property | Type | Meaning
------------ | ------------- | -------------
currentPoints | Cornerstone Coordinates | The current coordinates
keyCode | Number | [KeyboardEvent.keyCode](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode)
which | Number | The jQuery 'which' value for the mouse buttons which were held down when the event occurred. These are computed from the [event.buttons](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons) values [here](https://github.com/cornerstonejs/cornerstoneTools/blob/c9807489e5085f7a6720dd7e5943028aad747516/src/inputSources/mouseInput.js#L11). In future iterations (possibly 3.0) of Cornerstone Tools, we plan to deprecate the 'which' value in favour of the 'buttons' value.

#### Usage
```js
const element = document.querySelector('.my-cornerstone-element');

// Enable keyboard input
cornerstoneTools.keyboardInput.enable(element);

// Disable keyboard input
cornerstoneTools.keyboardInput.disable(element);
```
