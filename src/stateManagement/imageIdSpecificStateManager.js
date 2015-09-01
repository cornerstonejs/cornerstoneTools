(function(cornerstone, cornerstoneTools) {

    'use strict';

    // This implements an imageId specific tool state management strategy.  This means that
    // measurements data is tied to a specific imageId and only visible for enabled elements
    // that are displaying that imageId.

    function newImageIdSpecificToolStateManager() {
        var toolState = {};

        // here we add tool state, this is done by tools as well
        // as modules that restore saved state

        function saveImageIdToolState(imageId) {
            return toolState[imageId];
        }

        function restoreImageIdToolState(imageId, imageIdToolState) {
            toolState[imageId] = imageIdToolState;
        }

        function saveToolState() {
            return toolState;
        }

        function restoreToolState(savedToolState) {
            toolState = savedToolState;
        }

        // here we add tool state, this is done by tools as well
        // as modules that restore saved state
        function addImageIdSpecificToolState(element, toolType, data) {
            var enabledImage = cornerstone.getEnabledElement(element);
            // if we don't have any tool state for this imageId, add an empty object
            if (!enabledImage.image || toolState.hasOwnProperty(enabledImage.image.imageId) === false) {
                toolState[enabledImage.image.imageId] = {};
            }

            var imageIdToolState = toolState[enabledImage.image.imageId];

            // if we don't have tool state for this type of tool, add an empty object
            if (imageIdToolState.hasOwnProperty(toolType) === false) {
                imageIdToolState[toolType] = {
                    data: []
                };
            }

            var toolData = imageIdToolState[toolType];

            // finally, add this new tool to the state
            toolData.data.push(data);
        }

        // here you can get state - used by tools as well as modules
        // that save state persistently
        function getImageIdSpecificToolState(element, toolType) {
            var enabledImage = cornerstone.getEnabledElement(element);
            // if we don't have any tool state for this imageId, return undefined
            if (!enabledImage.image || toolState.hasOwnProperty(enabledImage.image.imageId) === false) {
                return;
            }

            var imageIdToolState = toolState[enabledImage.image.imageId];

            // if we don't have tool state for this type of tool, return undefined
            if (imageIdToolState.hasOwnProperty(toolType) === false) {
                return;
            }

            var toolData = imageIdToolState[toolType];
            return toolData;
        }

        // Clears all tool data from this toolStateManager.
        function clearImageIdSpecificToolStateManager(element) {
            var enabledImage = cornerstone.getEnabledElement(element);
            if (!enabledImage.image || toolState.hasOwnProperty(enabledImage.image.imageId) === false) {
                return;
            }

            delete toolState[enabledImage.image.imageId];
        }

        var imageIdToolStateManager = {
            get: getImageIdSpecificToolState,
            add: addImageIdSpecificToolState,
            clear: clearImageIdSpecificToolStateManager,
            saveImageIdToolState: saveImageIdToolState,
            restoreImageIdToolState: restoreImageIdToolState,
            saveToolState: saveToolState,
            restoreToolState: restoreToolState,
            toolState: toolState
        };
        return imageIdToolStateManager;
    }

    // a global imageIdSpecificToolStateManager - the most common case is to share state between all
    // visible enabled images
    var globalImageIdSpecificToolStateManager = newImageIdSpecificToolStateManager();
    
    // module/private exports
    cornerstoneTools.newImageIdSpecificToolStateManager = newImageIdSpecificToolStateManager;
    cornerstoneTools.globalImageIdSpecificToolStateManager = globalImageIdSpecificToolStateManager;

})(cornerstone, cornerstoneTools);
