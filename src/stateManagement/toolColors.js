 export default function() {
    var defaultColor = 'white',
        activeColor = 'greenyellow',
        fillColor = 'transparent';

    function setFillColor(color) {
        fillColor = color;
    }

    function getFillColor() {
        return fillColor;
    }

    function setToolColor(color) {
        defaultColor = color;
    }

    function getToolColor() {
        return defaultColor;
    }

    function setActiveToolColor(color) {
        activeColor = color;
    }

    function getActiveToolColor() {
        return activeColor;
    }

    function getColorIfActive(active) {
        return active ? activeColor : defaultColor;
    }

    return {
        setFillColor,
        getFillColor,
        setToolColor,
        getToolColor,
        setActiveColor,
        getActiveColor,
        getColorIfActive
    };
}