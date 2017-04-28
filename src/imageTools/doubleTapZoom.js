function fitToWindowStrategy(eventData) {
    cornerstone.fitToWindow(eventData.element);
}

function doubleTapCallback(e, eventData) {
    cornerstoneTools.doubleTapZoom.strategy(eventData);
    return false; // false = causes jquery to preventDefault() and stopPropagation() this event
}

const doubleTapZoom = cornerstoneTools.doubleTapTool(doubleTapCallback);
doubleTapZoom.strategies = {
    default: fitToWindowStrategy
};

doubleTapZoom.strategy = fitToWindowStrategy;

export default doubleTapZoom;