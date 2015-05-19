var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = "probe";

    ///////// BEGIN ACTIVE TOOL ///////
    function createNewMeasurement(mouseEventData)
    {
        // create the measurement data for this tool with the end handle activated
        var measurementData = {
            visible: true,
            handles: {
                end: {
                    x: mouseEventData.currentPoints.image.x,
                    y: mouseEventData.currentPoints.image.y,
                    highlight: true,
                    active: true
                }
            }
        };
        return measurementData;
    }
    ///////// END ACTIVE TOOL ///////

    function calculateSUV(image, storedPixelValue)
    {
        // if no dicom data set, return undefined
        if(image.data === undefined) {
            return undefined;
        }
        // image must be PET
        if(image.data.string('x00080060') !== "PT")
        {
            return undefined;
        }
        var modalityPixelValue = storedPixelValue * image.slope + image.intercept;

        var patientWeight = image.data.floatString('x00101030'); // in kg
        if(patientWeight === undefined)
        {
            return undefined;
        }
        var petSequence = image.data.elements.x00540016;
        if(petSequence === undefined) {
            return undefined;
        }
        petSequence = petSequence.items[0].dataSet;
        var startTime = petSequence.time('x00181072');
        var totalDose = petSequence.floatString('x00181074');
        var halfLife = petSequence.floatString('x00181075');
        var acquisitionTime = image.data.time('x00080032');
        if(startTime === undefined || totalDose === undefined || halfLife === undefined || acquisitionTime === undefined)
        {
            return undefined;
        }

        var acquisitionTimeInSeconds = acquisitionTime.fractionalSeconds + acquisitionTime.seconds + acquisitionTime.minutes * 60 + acquisitionTime.hours * 60 * 60;
        var injectionStartTimeInSeconds = startTime.fractionalSeconds + startTime.seconds + startTime.minutes * 60 + startTime.hours * 60 * 60;
        var durationInSeconds = acquisitionTimeInSeconds - injectionStartTimeInSeconds;
        var correctedDose = totalDose * Math.exp(-durationInSeconds * Math.log(2) / halfLife);
        var suv = modalityPixelValue * patientWeight / correctedDose * 1000;

        return suv;
    }
    ///////// BEGIN IMAGE RENDERING ///////
    function pointNearTool(data, coords) {
        return  cornerstoneMath.point.distance(data.handles.end, coords) < 5;
    }


    function onImageRendered(e, eventData) {

        // if we have no toolData for this element, return immediately as there is nothing to do
        var toolData = cornerstoneTools.getToolState(e.currentTarget, toolType);
        if(toolData === undefined) {
            return;
        }

        // we have tool data for this element - iterate over each one and draw it
        var context = eventData.canvasContext.canvas.getContext("2d");
        cornerstone.setToPixelCoordinateSystem(eventData.enabledElement, context);
        var color="white";
        for(var i=0; i < toolData.data.length; i++) {
            context.save();
            var data = toolData.data[i];
            
            if (pointNearTool(data, cornerstoneTools.activeToolcoordinate.getCoords())) {
                data.active = true;
                color = cornerstoneTools.activeToolcoordinate.getActiveColor();
            } else {
                data.active = false;
                color = cornerstoneTools.activeToolcoordinate.getToolColor();
            }

            // draw the handles
            context.beginPath();
            cornerstoneTools.drawHandles(context, eventData, data.handles,color);
            context.stroke();

            // Draw text
            var fontParameters = cornerstoneTools.setContextToDisplayFontSize(eventData.enabledElement, eventData.canvasContext, 15);
            context.font = "" + fontParameters.fontSize + "px Arial";

            // translate the x/y away from the cursor
            var x = Math.round(data.handles.end.x);
            var y = Math.round(data.handles.end.y);
            textX = data.handles.end.x + 3;
            textY = data.handles.end.y - 3;

            var textX = textX / fontParameters.fontScale;
            var textY = textY / fontParameters.fontScale;

            context.fillStyle = "white";

            var storedPixels = cornerstone.getStoredPixels(eventData.element, x, y, 1, 1);
            var sp = storedPixels[0];
            var mo = sp * eventData.image.slope + eventData.image.intercept;
            var suv = calculateSUV(eventData.image, sp);


            context.fillText("" + x + "," + y, textX, textY);
            var str = "SP: " + sp + " MO: " + mo.toFixed(3);
            if(suv !== undefined) {
                str += " SUV: " + suv.toFixed(3);
            }
            context.fillText(str, textX, textY + fontParameters.lineHeight);

            context.restore();
        }
    }
    ///////// END IMAGE RENDERING ///////


    // module exports
    cornerstoneTools.probe = cornerstoneTools.mouseButtonTool({
        createNewMeasurement : createNewMeasurement,
        onImageRendered: onImageRendered,
        toolType : toolType
    });
    cornerstoneTools.probeTouch = cornerstoneTools.touchTool({
        createNewMeasurement: createNewMeasurement,
        onImageRendered: onImageRendered,
        toolType: toolType
    });

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
