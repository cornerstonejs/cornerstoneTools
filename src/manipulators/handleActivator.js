function getActiveHandle(handles) {
    var activeHandle;

    Object.keys(handles).forEach(function(name) {
        var handle = handles[name];
        if (handle.active === true) {
            activeHandle = handle;
            return;
        }
    });

    return activeHandle;
}

export default function(element, handles, canvasPoint, distanceThreshold) {
    if (!distanceThreshold) {
        distanceThreshold = 6;
    }

    var activeHandle = getActiveHandle(handles);
    var nearbyHandle = getHandleNearImagePoint(element, handles, canvasPoint, distanceThreshold);
    if (activeHandle !== nearbyHandle) {
        if (nearbyHandle !== undefined) {
            nearbyHandle.active = true;
        }

        if (activeHandle !== undefined) {
            activeHandle.active = false;
        }

        return true;
    }

    return false;
}