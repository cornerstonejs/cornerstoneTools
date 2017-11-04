# Version 1.0.1

- Add check to make drag (touch or click) stack scrolling work better on very large stacks.

The previous behaviour led to scrolling more than 1 image per pixel if there were more images than the height of the element in pixels, which wasn't a good user experience.

New behaviour is to scroll at most 1 image per 2 pixels, and at least 1 image per 1/8 of the element height. (thanks @Maistho)

- Switch package.json 'main' to minified version to reduce bundle sizes
- Fixed incorrect 'externals' to 'external' in README (thanks @nicomlas)
- Fixed incorrect cornerstone-core devDependency (ˆ0.13.0 to ˆ1.0.0)

# Version 1.0.0

- Updated to 1.0.0 because 0.10.0 introduced a breaking change with Cornerstone, jQuery, and Hammer.js injection. This doesn't break usage if you are using HTML script tags, but if you are using a module system, Cornerstone Tools may not properly find its dependencies.

The solution for this is to inject your Cornerstone / jQuery / Hammers instance into Cornerstone Tools as follows:

````javascript
cornerstoneTools.external.$ = $;
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.external.cornerstone = cornerstone;
````

An example commit doing this in the OHIF Viewer Meteor application is here: https://github.com/OHIF/Viewers/commit/012bba44806d0fb9bb60af329c4875e7f6b751e0#diff-d9ccd906dfc48b4589d720766fe14715R25

We apologize for any headaches that the breaking change 0.10.0 may have caused for those using module systems.

# Version 0.10.0 (deprecated due to breaking change)

- Add a 3rd parameter to saveAs to allow other mimeTypes, such as image/jpeg
- Made Cornerstone, Jquery and Hammer as injection dependencies
- Using window.cornerstone as default cornerstone for this library
- Fix `window.event.wheelDelta` in IE

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