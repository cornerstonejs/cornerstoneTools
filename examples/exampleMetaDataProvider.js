(function metaDataProvider(cornerstone) {

    "use strict";

    function metaDataProvider(type, imageId)
    {
        if(type === 'imagePlaneModule') {

            if (imageId === 'example://1') {
                return {
                    frameOfReferenceUID: '1.2.3.4.5',
                    rows: 256,
                    columns: 256,
                    rowCosines: new cornerstoneMath.Vector3(0, 1, 0),
                    columnCosines: new cornerstoneMath.Vector3(0, 0, -1),
                    imagePositionPatient: new cornerstoneMath.Vector3(-9.4, -92.5, 98),
                    columnPixelSpacing: 0.78,
                    rowPixelSpacing: 0.78
                };
            }
            if (imageId === 'example://2') {
                return {
                    frameOfReferenceUID: '1.2.3.4.5',
                    rows: 256,
                    columns: 256,
                    rowCosines: new cornerstoneMath.Vector3(0, 1, 0),
                    columnCosines: new cornerstoneMath.Vector3(0, 0, -1),
                    imagePositionPatient: new cornerstoneMath.Vector3(-7, -92.5, 98),
                    columnPixelSpacing: 0.78,
                    rowPixelSpacing: 0.78
                };
            }
            if (imageId === 'example://3') {
                return {
                    frameOfReferenceUID: '1.2.3.4.5',
                    rows: 256,
                    columns: 256,
                    rowCosines: new cornerstoneMath.Vector3(1, 0, 0),
                    columnCosines: new cornerstoneMath.Vector3(0, 0, -1),
                    imagePositionPatient: new cornerstoneMath.Vector3(-100, -13, 98),
                    columnPixelSpacing: 0.78,
                    rowPixelSpacing: 0.78
                };
            }
        }
        else if(type === 'image') {
            if (imageId === 'example://1') {
                return {
                };
            }
        }
        return undefined;
    }

    cornerstone.metaData.addProvider(metaDataProvider);

})(cornerstone);