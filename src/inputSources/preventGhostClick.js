(function(cornerstoneTools) {

    'use strict';

    // Functions to prevent ghost clicks following a touch
    // All credit to @kosich
    // https://gist.github.com/kosich/23188dd86633b6c2efb7

    var antiGhostDelay = 2000,
        pointerType = {
            mouse: 0,
            touch: 1
        },
        lastInteractionType,
        lastInteractionTime;

    function handleTap(type, e) {
        console.log('preventGhostClick handleTap, type: ' + type);
        var now = Date.now();
        if (type !== lastInteractionType) {
            if (now - lastInteractionTime <= antiGhostDelay) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
            }

            lastInteractionType = type;
        }

        lastInteractionTime = now;
    }

    // Cacheing the function references
    // Necessary because a new function reference is created after .bind() is called
    // http://stackoverflow.com/questions/11565471/removing-event-listener-which-was-added-with-bind
    var handleTapMouse = handleTap.bind(null, pointerType.mouse);
    var handleTapTouch = handleTap.bind(null, pointerType.touch);

    function attachEvents(element, eventList, interactionType) {
        var tapHandler = interactionType ? handleTapMouse : handleTapTouch;
        eventList.forEach(function(eventName) {
            element.addEventListener(eventName, tapHandler, true);
        });
    }

    function removeEvents(element, eventList, interactionType) {
        var tapHandler = interactionType ? handleTapMouse : handleTapTouch;
        eventList.forEach(function(eventName) {
            element.removeEventListener(eventName, tapHandler, true);
        });
    }

    var mouseEvents = [ 'mousedown', 'mouseup', 'mousemove' ];
    var touchEvents = [ 'touchstart', 'touchend' ];

    function disable(element) {
        console.log('preventGhostClick disabled');
        removeEvents(element, mouseEvents, pointerType.mouse);
        removeEvents(element, touchEvents, pointerType.touch);
    }

    function enable(element) {
        disable(element);
        console.log('preventGhostClick enabled');
        attachEvents(element, mouseEvents, pointerType.mouse);
        attachEvents(element, touchEvents, pointerType.touch);
    }

    cornerstoneTools.preventGhostClick = {
        enable: enable,
        disable: disable
    };

})(cornerstoneTools);
