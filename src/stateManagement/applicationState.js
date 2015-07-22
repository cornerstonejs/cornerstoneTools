(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function saveApplicationState(elements) {
        // Save imageId-specific tool state data
        var appState = {
            imageIdToolState: cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState()
        };

        // For each of the given elements, save the viewport and any stack-specific tool data
        elements.forEach(function(element) {
            var toolStateManager = cornerstoneTools.getElementToolStateManager(element);
            if (toolStateManager === cornerstoneTools.globalImageIdSpecificToolStateManager) {
                return;
            }

            appState.elementToolState[element] = toolStateManager.saveState();

            appState.elementViewport[element] = cornerstone.getViewport(element);
        });
        return appState;
    }

    function restoreApplicationState(appState) {
        // Make sure t
        if (!appState.hasOwnProperty('imageIdToolState') ||
            !appState.hasOwnProperty('elementToolState') ||
            !appState.hasOwnProperty('elementViewport')) {
            return;
        }

        // Restore all the imageId specific tool data
        cornerstoneTools.globalImageIdSpecificToolStateManager.restoreToolState(appState.imageIdToolState);

        Object.keys(appState.elementViewport).forEach(function(element) {
            // Restore any stack specific tool data
            if (!appState.elementToolState.hasOwnProperty(element)) {
                return;
            }
            
            var toolStateManager = cornerstoneTools.getElementToolStateManager(element);
            if (toolStateManager === cornerstoneTools.globalImageIdSpecificToolStateManager) {
                return;
            }

            toolStateManager.restoreState(appState.elements[element]);

            // Restore the saved viewport information
            cornerstone.setViewport(appState.elementViewport[element]);

            // Update the element to apply the viewport and tool changes
            cornerstone.updateImage(element);
        });
        return appState;
    }

    cornerstoneTools.appState = {
        save: saveApplicationState,
        restore: restoreApplicationState
    };

})($, cornerstone, cornerstoneTools);
