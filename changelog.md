# Version 0.9.1

- Added eventType, ctrlKey, metaKey and shiftKey to cornerstoneTools eventData on mouseMove event
- Fixing tool handles on non-chrome browsers
- Keeping compatibility with event.which for mouseInput events
- Direct module loading with <script type="mode" ...>
- Hammer.js and JQuery are not global anymore, using imports
- PlayClip using stackRenderer
- FusionRenderer display the image instead of only updating the element
- Add loop option to stackScroll configuration
- Fix paintbrush canvas size issue
- Ignoring the exception thrown when the image is loaded by playClip and the element is not enabled
- Use shallow copies of images in layers, to prevent the function convertImageToFalseColorImage() from altering original images.
- fusionRenderer does not crash if the layer is destroyed while rendering
- Added state manager to brush tool
- If initialData.distances[sourceImageId] is undefined in Synchroziner.js, keep positionDifference undefined  instead of crashing
- Resolve the error "Error during loading "karma-phantomjs-launcher" plugin: Path must be a string. Received null", throwed when submiting the PR.
- Remove the useless variable 'viewport' in playClip.js and scrollToIndex.js
- LengthTool now uses PixelSpacing provided by MetaDataProvider