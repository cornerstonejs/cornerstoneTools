# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [2.1.1] - 2018-03-21
### Added
- Added general area calculation for irregular polygons of N sides. (thanks @JamesAPetts)
- Added textbox to show data from the area of the polygons of N sides, it does not affect 'pencil' mode (thanks @JamesAPetts)
- The textbox-polygon tether snaps to nearest node of the polygon when moved.(thanks @JamesAPetts)

### Changed
- Disallows the user to join up to any previous point besides the starting node (i.e. shape must be complete before tool deactivates). (thanks @JamesAPetts)
- Disallows the user to cross lines (using a orientation algorithm).(thanks @JamesAPetts)

### Fixed
- Fixed a UI bug, where upon editing the first node the line connecting the first and last nodes would not reactively update.(thanks @JamesAPetts)


## [2.1.0] - 2018-03-02
### Added
- Added configuration and functional option to scroll a stack without skipping images (thanks @jdnarvaez)
- Added support for allowing inputs to be enabled before loading an image (thanks @medihack)

### Fixed
- Fixed memory leak from use of getToolOption and setToolOption (thanks @nspin)
- Fixed an exception with crosshairs tool by skipping when image plane is not ready
- Fixed incorrect scroll direction
- Fixed a bug when activating stackScroll before stackScrollTouchDrag at the same time (thanks @vaibhav2383)


## [2.0.0] - 2017-12-13
### Added
- Began the [Getting Started guide](https://tools.cornerstonejs.org/essentials/getting-started.html) (thanks @dannyrb)
- Since we are now using addEventListener/removeEventListener instead of jQuery's on/off, we had to create a separate cache for event data for each element / tool type combination since it cannot be passed to the handler when creating the listener.

This is present in toolOptions.js and available as ````setToolOptions(toolType, element, options)```` and ````getToolOptions(toolType, element)````. These are now used to keep track of which mouse button is enabled for which tool and element.

### Changed
- *Breaking Change!!!* Removed all dependence on jQuery. This was a long process and we'd like to thank all the contributors that have come forward from the community to help.

If you are listening to any Cornerstone Tools event, and your event handler has the signature

````javascript
function(event, eventData) {
	// do stuff
}````

You need to switch it to:

````javascript
function(event) {
	const eventData = event.detail;
	// do stuff
}
````

since this is how it is now being fired using native CustomEvents.

- *Breaking Change!!!* Lower-cased all event names. This was done because we had two parallel sets of events (jQuery events and native Custom Events) in the previous major version. The jQuery events have now been removed. Check events.js for the list of event names. e.g. CornerstoneToolsMouseDrag -> cornerstonetoolsmousedrag

- *Breaking Change!!!* jQuery Events are no longer being dispatched by triggerEvent.js

- *Breaking Change!!!* Cornerstone Tools now depends on Cornerstone Core >= 2.0.0.

- Removed jQuery from nearly all of the examples and replaced with native APIs. It is still being used in the All Image Tools example, solely for the Bootstrap dropdown.
- Centralized all of the event names in events.js
- Switched ESLint's capitalized-comments warning to ignore inline comments

## [1.1.3] - 2017-12-13
### Added
- Gitbook integration for improving our documentation. View it live at https://tools.cornerstonejs.org (thanks @dannyrb)
- eslint-plugin-import to force us to keep .js in the import paths and make sure all of our paths resolve

### Changed
- Moved the repository from Chris Hafey's (@chafey) personal page to a new Organization (@cornerstonejs). Renamed all the relevant links. Join us at @cornerstonejs to start contributing!
- Modernized the README with GIFs for each example (thanks @dannyrb)
- Bug fix for stackImagePositionSynchronizer for cases where no imagePositionPatient exists for an image (thanks @adreyfus)
- saveAs tool now uses canvas.toDataURL image quality of 1 by default (thanks @andrebot)

## [1.1.2] - 2017-11-21
### Changed
- Fix bug (#293) introduced in 1.1.1 a missing argument in pointProjector (thanks @hardmaster92)

## [1.1.1] - 2017-11-21
### Added
- cornerstoneMath can now be specified as an external module. Use:

````javascript
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
````

to do so. This is not required for normal use, as window.cornerstoneMath is the default.

### Changed
- imagePlaneModule metaData is no longer required to be cornerstoneMath.Vector3 format. These can be passed in as arrays of length 3 (i.e. [x, y, z]). This change was made so that cornerstoneWADOImageLoader didn't need to pull in cornerstoneMath.

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
