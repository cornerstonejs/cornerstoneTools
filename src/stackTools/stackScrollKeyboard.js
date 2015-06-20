var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = "stackScrollKeyboard";

    var keys = {
        UP: 38,
        DOWN: 40
    };

    function keyDownCallback(e, eventData) {
        var keyCode = eventData.keyCode;
        if (keyCode !== keys.UP && keyCode !== keys.DOWN) {
            return;
        }

        var images = 1;
        if (keyCode === keys.DOWN) {
            images = -1;
        }
        cornerstoneTools.scroll(eventData.element, images);
    }


    // module/private exports
    cornerstoneTools.stackScrollKeyboard = cornerstoneTools.keyboardTool(keyDownCallback);

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));