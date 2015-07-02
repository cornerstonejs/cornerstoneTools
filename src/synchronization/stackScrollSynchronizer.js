// Begin Source: src/synchronization/stackScrollSynchronizer.js
var cornerstoneTools = (function($, cornerstone, cornerstoneTools) {

    'use strict';

    if (cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    // This function causes any scrolling actions within the stack to propagate to 
    // all of the other viewports that are synced
    function stackScrollSynchronizer(synchronizer, sourceElement, targetElement, eventData) {

        // If the target and source are the same, ignore
        if (sourceElement === targetElement) {
            // TODO: Look into incrementing here or pulling the previous index
            //       as the built-in scrolling may take over

            return;
        }

        // If there is no event, ignore synchronization
        if (eventData === undefined) {
            return;
        }

        // Target the stack of the target viewport
        var targetStackToolDataSource = cornerstoneTools.getToolState(targetElement, 'stack');
        var targetStackData = targetStackToolDataSource.data[0];

        // It's not the same area, so scroll if able
        var direction = eventData.direction;

        // Get the current index for the stack
        var newImageIdIndex = targetStackData.currentImageIdIndex;

        // Update the position based on the direction
        newImageIdIndex = (direction < 0) ? newImageIdIndex + 1 : newImageIdIndex - 1;

        // Ensure the index does not exceed the bounds of the stack
        newImageIdIndex = Math.min(Math.max(newImageIdIndex, 0), targetStackData.imageIds.length - 1);

        // If the index has not changed, ignore it
        if (targetStackData.currentImageIdIndex === newImageIdIndex) {
            return;
        }

        // Otherwise load the image
        cornerstone.loadAndCacheImage(targetStackData.imageIds[newImageIdIndex]).then(function(image) {
            var viewport = cornerstone.getViewport(targetElement);
            targetStackData.currentImageIdIndex = newImageIdIndex;
            synchronizer.displayImage(targetElement, image, viewport);
        });
    }

    // module/private exports
    cornerstoneTools.stackScrollSynchronizer = stackScrollSynchronizer;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
// End Source; src/synchronization/stackScrollSynchronizer.js
