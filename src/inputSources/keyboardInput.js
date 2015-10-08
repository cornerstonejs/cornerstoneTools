(function($, cornerstone, cornerstoneTools) {

    'use strict';

    var mouseX, mouseY;

    function keyPress(e) {
        var element = e.currentTarget;
        var startingCoords = cornerstone.pageToPixel(element, mouseX, mouseY);

        e = window.event || e; // old IE support

        var keyPressData = {
            element: element,
            viewport: cornerstone.getViewport(element),
            image: cornerstone.getEnabledElement(element).image,
            pageX: mouseX,
            pageY: mouseY,
            imageX: startingCoords.x,
            imageY: startingCoords.y,
            keyCode: e.keyCode,
            which: e.which
        };

        if (e.type === 'keydown') {
            $(element).trigger('CornerstoneToolsKeyDown', keyPressData);
        } else if (e.type === 'keypress') {
            $(element).trigger('CornerstoneToolsKeyPress', keyPressData);
        } else if (e.type === 'keyup') {
            $(element).trigger('CornerstoneToolsKeyUp', keyPressData);
        }
    }

    function mouseMove(e) {
        mouseX = e.pageX || e.originalEvent.pageX;
        mouseY = e.pageY || e.originalEvent.pageY;
    }

    var keyboardEvent = 'keydown keypress keyup';

    function enable(element) {
        $(element).bind(keyboardEvent, keyPress);
        $(element).on('mousemove', mouseMove);
    }

    function disable(element) {
        $(element).unbind(keyboardEvent, keyPress);
    }

    // module exports
    cornerstoneTools.keyboardInput = {
        enable: enable,
        disable: disable
    };

})($, cornerstone, cornerstoneTools);
