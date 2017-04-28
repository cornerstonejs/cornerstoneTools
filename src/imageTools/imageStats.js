function onImageRendered(e) {
    var eventData = e.detail;
    var image = eventData.image;
    var stats = image.stats;

    var context = eventData.canvasContext.canvas.getContext('2d');
    context.setTransform(1, 0, 0, 1, 0, 0);

    var textLines = [];
    Object.keys(stats).forEach(function(key) {
        var text = key + ' : ' + stats[key];
        textLines.push(text);
    });

    cornerstoneTools.drawTextBox(context, textLines, 0, 0, 'orange');

    textLines.forEach(function(text) {
        console.log(text);
    });
}

const imageStats = cornerstoneTools.displayTool(onImageRendered);

export default imageStats;