(function(cornerstone, cornerstoneTools) {

    'use strict';

    function getElementToolStateManager(element) {
        var enabledImage = cornerstone.getEnabledElement(element);
        // if the enabledImage has no toolStateManager, create a default one for it
        // NOTE: This makes state management element specific
        if (enabledImage.toolStateManager === undefined) {
            enabledImage.toolStateManager = cornerstoneTools.globalImageIdSpecificToolStateManager;
        }

        return enabledImage.toolStateManager;
    }

    // here we add tool state, this is done by tools as well
    // as modules that restore saved state
    function addToolState(element, toolType, data) {
        var toolStateManager = getElementToolStateManager(element);
        toolStateManager.add(element, toolType, data);

        var eventType = 'CornerstoneToolsMeasurementAdded';
        var eventData = {
            toolType: toolType,
            element: element,
            measurementData: data
        };
        $(element).trigger(eventType, eventData);
        // TODO: figure out how to broadcast this change to all enabled elements so they can update the image
        // if this change effects them
    }

    // here you can get state - used by tools as well as modules
    // that save state persistently
    function getToolState(element, toolType) {
        var toolStateManager = getElementToolStateManager(element);
        return toolStateManager.get(element, toolType);
    }

    function removeToolState(element, toolType, data) {
        var toolStateManager = getElementToolStateManager(element);
        var toolData = toolStateManager.get(element, toolType);
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

        var eventType = 'CornerstoneToolsMeasurementRemoved';
        var eventData = {
            toolType: toolType,
            element: element,
            measurementData: data
        };
        $(element).trigger(eventType, eventData);
    }

    function clearToolState(element, toolType) {
        var toolStateManager = getElementToolStateManager(element);
        var toolData = toolStateManager.get(element, toolType);
        
        // If any toolData actually exists, clear it
        if (toolData !== undefined) {
            toolData.data = [];
        }
    }

    // sets the tool state manager for an element
    function setElementToolStateManager(element, toolStateManager) {
        var enabledImage = cornerstone.getEnabledElement(element);
        enabledImage.toolStateManager = toolStateManager;
    }

    // module/private exports
    cornerstoneTools.addToolState = addToolState;
    cornerstoneTools.getToolState = getToolState;
    cornerstoneTools.removeToolState = removeToolState;
    cornerstoneTools.clearToolState = clearToolState;
    cornerstoneTools.setElementToolStateManager = setElementToolStateManager;
    cornerstoneTools.getElementToolStateManager = getElementToolStateManager;

})(cornerstone, cornerstoneTools);
