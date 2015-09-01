(function(cornerstone, cornerstoneTools) {

    'use strict';

    // This implements an Stack specific tool state management strategy.  This means
    // that tool data is shared between all imageIds in a given stack
    function newStackSpecificToolStateManager(toolTypes, oldStateManager) {
        var toolState = {};

        function saveToolState() {
            return toolState;
        }

        function restoreToolState(stackToolState) {
            toolState = stackToolState;
        }

        // here we add tool state, this is done by tools as well
        // as modules that restore saved state
        function addStackSpecificToolState(element, toolType, data) {
            // if this is a tool type to apply to the stack, do so
            if (toolTypes.indexOf(toolType) >= 0) {

                // if we don't have tool state for this type of tool, add an empty object
                if (toolState.hasOwnProperty(toolType) === false) {
                    toolState[toolType] = {
                        data: []
                    };
                }

                var toolData = toolState[toolType];

                // finally, add this new tool to the state
                toolData.data.push(data);
            } else {
                // call the imageId specific tool state manager
                return oldStateManager.add(element, toolType, data);
            }
        }

        // here you can get state - used by tools as well as modules
        // that save state persistently
        function getStackSpecificToolState(element, toolType) {
            // if this is a tool type to apply to the stack, do so
            if (toolTypes.indexOf(toolType) >= 0) {
                // if we don't have tool state for this type of tool, add an empty object
                if (toolState.hasOwnProperty(toolType) === false) {
                    toolState[toolType] = {
                        data: []
                    };
                }

                var toolData = toolState[toolType];
                return toolData;
            } else {
                // call the imageId specific tool state manager
                return oldStateManager.get(element, toolType);
            }
        }

        var stackSpecificToolStateManager = {
            get: getStackSpecificToolState,
            add: addStackSpecificToolState,
            saveToolState: saveToolState,
            restoreToolState: restoreToolState,
            toolState: toolState,
        };
        return stackSpecificToolStateManager;
    }

    var stackStateManagers = [];

    function addStackStateManager(element) {
        var oldStateManager = cornerstoneTools.getElementToolStateManager(element);
        if (!oldStateManager) {
            oldStateManager = cornerstoneTools.globalImageIdSpecificToolStateManager;
        }

        var stackTools = [ 'stack', 'stackPrefetch', 'playClip', 'volume', 'slab', 'referenceLines', 'crosshairs' ];
        var stackSpecificStateManager = cornerstoneTools.newStackSpecificToolStateManager(stackTools, oldStateManager);
        stackStateManagers.push(stackSpecificStateManager);
        cornerstoneTools.setElementToolStateManager(element, stackSpecificStateManager);
    }

    // module/private exports
    cornerstoneTools.newStackSpecificToolStateManager = newStackSpecificToolStateManager;
    cornerstoneTools.addStackStateManager = addStackStateManager;

})(cornerstone, cornerstoneTools);
