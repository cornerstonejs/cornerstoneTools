function fitToWindowStrategy(eventData) {
    cornerstone.fitToWindow(eventData.element);
}

function doubleTapCallback(e, eventData) {
    doubleTapZoom.strategy(eventData);
    return false; // false = causes jquery to preventDefault() and stopPropagation() this event
}

const doubleTapZoom = doubleTapTool(doubleTapCallback);
doubleTapZoom.strategies = {
    default: fitToWindowStrategy
};

doubleTapZoom.strategy = fitToWindowStrategy;

export default doubleTapZoom;