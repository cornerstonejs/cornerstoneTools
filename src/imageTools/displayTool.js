export default function(onImageRendered) {
    var configuration = {};

    var toolInterface = {
        disable: function(element) {element.removeEventListener('CornerstoneImageRendered', onImageRendered);},
        enable: function(element) {
            element.removeEventListener('CornerstoneImageRendered', onImageRendered);
            element.addEventListener('CornerstoneImageRendered', onImageRendered);
            cornerstone.updateImage(element);
        },
        getConfiguration: function() { return configuration; },
        setConfiguration: function(config) {configuration = config;}
    };

    return toolInterface;
}