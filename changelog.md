# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2017-11-17
### Added
- Internal triggerEvent function which triggers jQuery and CustomEvents side-by-side. These events are the same as the current
event names, but with all lower case letters. E.g. CornerstoneToolsMouseMove => cornerstonetoolsmousemove 

This will be the prevailing format moving forward, but you aren't forced to migrate until 2.0.0 when we plan to drop the jQuery events.

### Changed
- As part of the migration to drop jQuery, Cornerstone Tools is now listening exclusively to native CustomEvents triggered
from Cornerstone Core. We can now remove jQuery events from Core without breaking functionality in Tools.
- Fixed source map not showing up for Hammer.min.js in Examples
- Switched this changelog to try to follow http://keepachangelog.com/en/1.0.0/

## Version 1.0.3

- Biggest change: Tools that required 'imagePlane' metadata, now require 'imagePlaneModule': 

This is partly a breaking change but in reality will help most users, since CornerstoneWADOImageLoader is populating 'imagePlaneModule', not 'imagePlane'. Thanks to @dannyrb for this fix.

*Note*: If you have written your own metadata provider, you should now use 'imagePlaneModule' instead of 'imagePlane'. 

- Refactored the Brush tool into brush.js and brushTool.js. This works similarly to mouseButtonTool.
- Brush tool now draws / erases on a label map, which is rendered by Cornerstone with a color lookup table.
- Added an adaptive brush tool (thanks to @zelle-github of @Radiomics).

The adaptive brush (see Segmentation Brush example) uses the range of grey values in the original click location to help the user paint structures of similar intensity.

## Version 1.0.2

- The biggest behaviour change in this release comes from bug fixes to the fusion renderer.

When using the fusion renderer, this is how it works now:
- Stacks in Cornerstone Tools correspond to layers in Cornerstone Core. If you have ten stacks in your toolData and you are using the fusion renderer, you have ten layers.
- If no image is being displayed in the stack at any given time, the layer has image = undefined.
- The active layer cannot be changed to a layer with an undefined image. setActiveLayer will switch to the base layer in this case.
- When image is changed and current active layer has image=undefined, the active layer is set to the base layer.

- Update cornerstone-core dependency since stack fusion renderer now requires APIs added in Cornerstone Core 1.1.0 (cornerstone.setLayerImage)

- Added stackPrefetch configuration option for maximum amount of images to fetch (thanks @maistho)

This option was added to allow developers using very large stack (i.e. > 1000 images) to limit the prefetching behaviour. The default value is Infinity, so no changes are necessary for normal use.

- Bug fix for stackPrefetch: the first element on stackPrefetch.indicesToRequest wasn't being prefetched (thanks @lscoder). Closes #211

## Version 1.0.1

- Add check to make drag (touch or click) stack scrolling work better on very large stacks.

The previous behaviour led to scrolling more than 1 image per pixel if there were more images than the height of the element in pixels, which wasn't a good user experience.

New behaviour is to scroll at most 1 image per 2 pixels, and at least 1 image per 1/8 of the element height. (thanks @Maistho)

- Switch package.json 'main' to minified version to reduce bundle sizes
- Fixed incorrect 'externals' to 'external' in README (thanks @nicomlas)
- Fixed incorrect cornerstone-core devDependency (ˆ0.13.0 to ˆ1.0.0)

## Version 1.0.0

- Updated to 1.0.0 because 0.10.0 introduced a breaking change with Cornerstone, jQuery, and Hammer.js injection. This doesn't break usage if you are using HTML script tags, but if you are using a module system, Cornerstone Tools may not properly find its dependencies.

The solution for this is to inject your Cornerstone / jQuery / Hammers instance into Cornerstone Tools as follows:

````javascript
cornerstoneTools.external.$ = $;
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.external.cornerstone = cornerstone;
````

An example commit doing this in the OHIF Viewer Meteor application is here: https://github.com/OHIF/Viewers/commit/012bba44806d0fb9bb60af329c4875e7f6b751e0#diff-d9ccd906dfc48b4589d720766fe14715R25

We apologize for any headaches that the breaking change 0.10.0 may have caused for those using module systems.

## Version 0.10.0 (deprecated due to breaking change)

- Add a 3rd parameter to saveAs to allow other mimeTypes, such as image/jpeg
- Made Cornerstone, Jquery and Hammer as injection dependencies
- Using window.cornerstone as default cornerstone for this library
- Fix `window.event.wheelDelta` in IE

## Version 0.9.1

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