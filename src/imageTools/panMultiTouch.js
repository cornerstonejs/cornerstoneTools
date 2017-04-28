function touchPanCallback(e, eventData) {
    var config = panMultiTouch.getConfiguration();
    if (config && config.testPointers(eventData)) {
        eventData.viewport.translation.x += (eventData.deltaPoints.page.x / eventData.viewport.scale);
        eventData.viewport.translation.y += (eventData.deltaPoints.page.y / eventData.viewport.scale);
        cornerstone.setViewport(eventData.element, eventData.viewport);
        return false; // false = causes jquery to preventDefault() and stopPropagation() this event
    }
}

var configuration = {
    testPointers: function(eventData) {
        return (eventData.numPointers >= 2);
    }
};

const panMultiTouch = multiTouchDragTool(touchPanCallback);
panMultiTouch.setConfiguration(configuration);

export default panMultiTouch;