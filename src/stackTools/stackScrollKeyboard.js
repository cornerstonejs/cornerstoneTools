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
const stackScrollKeyboard = cornerstoneTools.keyboardTool(keyDownCallback);

export default stackScrollKeyboard;