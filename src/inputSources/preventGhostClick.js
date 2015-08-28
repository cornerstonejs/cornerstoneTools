(function(cornerstoneTools) {

    'use strict';

    // Functions to prevent ghost clicks following a touch
    // All credit to @kosich
    // https://gist.github.com/kosich/23188dd86633b6c2efb7

    var antiGhostDelay = 2000;

    var pointerType = {
        mouse: 0,
        touch: 1
    };

    function preventGhostClick(element) {
        var lastInteractionType,
            lastInteractionTime;

        function handleTap(type, e) {
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

        function attachEvents(eventList, interactionType) {
            eventList.forEach(function(eventName) {
                element.addEventListener(eventName, handleTap.bind(null, interactionType), true);
            });
        }

        var mouseEvents = [ 'mousedown', 'mouseup', 'mousemove' ];
        var touchEvents = [ 'touchstart', 'touchend' ];

        attachEvents(mouseEvents, pointerType.mouse);
        attachEvents(touchEvents, pointerType.touch);
    }

    cornerstoneTools.preventGhostClick = preventGhostClick;

})(cornerstoneTools);
