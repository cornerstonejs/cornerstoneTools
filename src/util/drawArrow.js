(function(cornerstoneTools) {

    'use strict';

    function drawArrow(context, start, end, color, lineWidth) {
        //variables to be used when creating the arrow
        var headLength = 10;

        var angle = Math.atan2(end.y - start.y, end.x - start.x);

        //starting path of the arrow from the start square to the end square and drawing the stroke
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.stroke();

        //starting a new path from the head of the arrow to one of the sides of the point
        context.beginPath();
        context.moveTo(end.x, end.y);
        context.lineTo(end.x - headLength * Math.cos(angle - Math.PI / 7), end.y - headLength * Math.sin(angle - Math.PI / 7));

        //path from the side point of the arrow, to the other side point
        context.lineTo(end.x - headLength * Math.cos(angle + Math.PI / 7), end.y - headLength * Math.sin(angle + Math.PI / 7));

        //path from the side point back to the tip of the arrow, and then again to the opposite side point
        context.lineTo(end.x, end.y);
        context.lineTo(end.x - headLength * Math.cos(angle - Math.PI / 7), end.y - headLength * Math.sin(angle - Math.PI / 7));

        //draws the paths created above
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.stroke();
        context.fillStyle = color;
        context.fill();
    }

    // Module exports
    cornerstoneTools.drawArrow = drawArrow;

})(cornerstoneTools);
