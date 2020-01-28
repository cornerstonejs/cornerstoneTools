(function metaDataProvider(cornerstone) {
  'use strict';

  function metaDataProvider(type, imageId) {
    if (type === 'imagePlaneModule') {
      if (imageId === 'example://1') {
        return {
          frameOfReferenceUID: '1.2.3.4.5',
          rows: 256,
          columns: 256,
          rowCosines: [0, 1, 0],
          columnCosines: [0, 0, -1],
          imagePositionPatient: [-9.4, -92.5, 98],
          columnPixelSpacing: 0.78,
          rowPixelSpacing: 0.78,
        };
      } else if (imageId === 'example://2') {
        return {
          frameOfReferenceUID: '1.2.3.4.5',
          rows: 256,
          columns: 256,
          rowCosines: [0, 1, 0],
          columnCosines: [0, 0, -1],
          imagePositionPatient: [-7, -92.5, 98],
          columnPixelSpacing: 0.78,
          rowPixelSpacing: 0.78,
        };
      } else if (imageId === 'example://3') {
        return {
          frameOfReferenceUID: '1.2.3.4.5',
          rows: 256,
          columns: 256,
          rowCosines: [1, 0, 0],
          columnCosines: [0, 0, -1],
          imagePositionPatient: [-100, -13, 98],
          columnPixelSpacing: 0.78,
          rowPixelSpacing: 0.78,
        };
      } else if (
        imageId ===
        'dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.11.dcm'
      ) {
        return {
          frameOfReferenceUID:
            '1.3.6.1.4.1.25403.52237031786.3872.20100510032220.6',
          rows: 512,
          columns: 512,
          rowCosines: [1, 0, 0],
          columnCosines: [0, 1, 0],
          imagePositionPatient: [-249.51172, -460.51172, -615.5],
          columnPixelSpacing: 0.9765625,
          rowPixelSpacing: 0.9765625,
        };
      } else if (
        imageId ===
        'dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.12.dcm'
      ) {
        return {
          frameOfReferenceUID:
            '1.3.6.1.4.1.25403.52237031786.3872.20100510032220.6',
          rows: 512,
          columns: 512,
          rowCosines: [1, 0, 0],
          columnCosines: [0, 1, 0],
          imagePositionPatient: [-249.51172, -460.51172, -612.5],
          columnPixelSpacing: 0.9765625,
          rowPixelSpacing: 0.9765625,
        };
      }
    }
  }

  console.log('adding metadata provider');

  cornerstone.metaData.addProvider(metaDataProvider);
})(cornerstone);
