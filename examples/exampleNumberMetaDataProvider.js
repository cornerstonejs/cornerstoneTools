(function (cornerstoneTools) {

    "use strict";

    function metaDataProvider(type, imageId)
    {
        if(type === 'imagePlaneModule') {

            if (imageId.startsWith('example-n')) {
                var tokens = imageId.substring(12).split(':');
                var n = Number(tokens[0]);
                var z = window.isNaN(n)?0:n;
                return {
                    frameOfReferenceUID: '1.2.3.4.5',
                    rows: 256,
                    columns: 256,
                    rowCosines: new cornerstoneMath.Vector3(0, 1, 0),
                    columnCosines: new cornerstoneMath.Vector3(0, 0, -1),
                    imagePositionPatient: new cornerstoneMath.Vector3(-9.4, -92.5, z),
                    columnPixelSpacing: 0.78,
                    rowPixelSpacing: 0.78
                };
            }
        return undefined;
        }
    }

    cornerstoneTools.metaData.addProvider(metaDataProvider);

}(cornerstoneTools));