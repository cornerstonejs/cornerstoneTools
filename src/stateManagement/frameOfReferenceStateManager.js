(function($, cornerstone, cornerstoneTools) {

    'use strict';

    // This implements a frame-of-reference specific tool state management strategy.  This means that
    // measurement data are tied to a specific frame of reference UID and only visible to objects using
    // that frame-of-reference UID

    function newFrameOfReferenceSpecificToolStateManager() {
        var toolState = {};

        // here we add tool state, this is done by tools as well
        // as modules that restore saved state
        function addFrameOfReferenceSpecificToolState(frameOfReference, toolType, data) {
            // if we don't have any tool state for this frameOfReference, add an empty object
            if (toolState.hasOwnProperty(frameOfReference) === false) {
                toolState[frameOfReference] = {};
            }

            var frameOfReferenceToolState = toolState[frameOfReference];

            // if we don't have tool state for this type of tool, add an empty object
            if (frameOfReferenceToolState.hasOwnProperty(toolType) === false) {
                frameOfReferenceToolState[toolType] = {
                    data: []
                };
            }

            var toolData = frameOfReferenceToolState[toolType];

            // finally, add this new tool to the state
            toolData.data.push(data);
        }

        // here you can get state - used by tools as well as modules
        // that save state persistently
        function getFrameOfReferenceSpecificToolState(frameOfReference, toolType) {
            // if we don't have any tool state for this frame of reference, return undefined
            if (toolState.hasOwnProperty(frameOfReference) === false) {
                return;
            }

            var frameOfReferenceToolState = toolState[frameOfReference];

            // if we don't have tool state for this type of tool, return undefined
            if (frameOfReferenceToolState.hasOwnProperty(toolType) === false) {
                return;
            }

            var toolData = frameOfReferenceToolState[toolType];
            return toolData;
        }

        function removeFrameOfReferenceSpecificToolState(frameOfReference, toolType, data) {
            // if we don't have any tool state for this frame of reference, return undefined
            if (toolState.hasOwnProperty(frameOfReference) === false) {
                return;
            }

            var frameOfReferenceToolState = toolState[frameOfReference];

            // if we don't have tool state for this type of tool, return undefined
            if (frameOfReferenceToolState.hasOwnProperty(toolType) === false) {
                return;
            }

            var toolData = frameOfReferenceToolState[toolType];
            // find this tool data
            var indexOfData = -1;
            for (var i = 0; i < toolData.data.length; i++) {
                if (toolData.data[i] === data) {
                    indexOfData = i;
                }
            }

            if (indexOfData !== -1) {
                toolData.data.splice(indexOfData, 1);
            }
        }

        var frameOfReferenceToolStateManager = {
            get: getFrameOfReferenceSpecificToolState,
            add: addFrameOfReferenceSpecificToolState,
            remove: removeFrameOfReferenceSpecificToolState
        };
        return frameOfReferenceToolStateManager;
    }

    // a global frameOfReferenceSpecificToolStateManager - the most common case is to share 3d information
    // between stacks of images
    var globalFrameOfReferenceSpecificToolStateManager = newFrameOfReferenceSpecificToolStateManager();
    
    // module/private exports
    cornerstoneTools.newFrameOfReferenceSpecificToolStateManager = newFrameOfReferenceSpecificToolStateManager;
    cornerstoneTools.globalFrameOfReferenceSpecificToolStateManager = globalFrameOfReferenceSpecificToolStateManager;

})($, cornerstone, cornerstoneTools);
