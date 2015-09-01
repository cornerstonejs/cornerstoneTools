(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function saveApplicationState(elements) {
        // Save imageId-specific tool state data
        var appState = {
            imageIdToolState: cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState(),
            elementToolState: {},
            elementViewport: {}
        };

        // For each of the given elements, save the viewport and any stack-specific tool data
        elements.forEach(function(element) {
            var toolStateManager = cornerstoneTools.getElementToolStateManager(element);
            if (toolStateManager === cornerstoneTools.globalImageIdSpecificToolStateManager) {
                return;
            }

            appState.elementToolState[element.id] = toolStateManager.saveToolState();

            appState.elementViewport[element.id] = cornerstone.getViewport(element);
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

        Object.keys(appState.elementViewport).forEach(function(elementId) {
            // Restore any stack specific tool data
            var element = document.getElementById(elementId);
            if (!element) {
                return;
            }

            if (!appState.elementToolState.hasOwnProperty(elementId)) {
                return;
            }
            
            var toolStateManager = cornerstoneTools.getElementToolStateManager(element);
            if (toolStateManager === cornerstoneTools.globalImageIdSpecificToolStateManager) {
                return;
            }

            toolStateManager.restoreToolState(appState.elementToolState[elementId]);

            // Restore the saved viewport information
            var savedViewport = appState.elementViewport[elementId];
            cornerstone.setViewport(element, savedViewport);

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
