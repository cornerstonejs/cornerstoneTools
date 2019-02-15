(function (cornerstone) {
  'use strict';

  function metaDataProvider (type, imageId) {
    if (type === 'imagePlaneModule') {
      if (imageId === 'ct://1') {
        return {
          frameOfReferenceUID:
            '1.3.6.1.4.1.5962.99.1.2237260787.1662717184.1234892907507.1411.0',
          rows: 512,
          columns: 512,
          rowCosines: [1, 0, 0],
          columnCosines: [0, 1, 0],
          imagePositionPatient: [-250, -250, -399.100006],
          rowPixelSpacing: 0.976562,
          columnPixelSpacing: 0.976562
        };
      } else if (imageId === 'ct://2') {
        return {
          frameOfReferenceUID:
            '1.3.6.1.4.1.5962.99.1.2237260787.1662717184.1234892907507.1411.0',
          rows: 512,
          columns: 512,
          rowCosines: [1, 0, 0],
          columnCosines: [0, 1, 0],
          imagePositionPatient: [-250, -250, -395.829987],
          rowPixelSpacing: 0.976562,
          columnPixelSpacing: 0.976562
        };
      } else if (imageId === 'pet://1') {
        return {
          frameOfReferenceUID:
            '1.3.6.1.4.1.5962.99.1.2237260787.1662717184.1234892907507.1411.0',
          rows: 128,
          columns: 128,
          rowCosines: [1, 0, 0],
          columnCosines: [0, 1, 0],
          imagePositionPatient: [-297.65625, -297.65625, -399.12002563476],
          rowPixelSpacing: 4.6875,
          columnPixelSpacing: 4.6875
        };
      } else if (imageId === 'pet://2') {
        return {
          frameOfReferenceUID:
            '1.3.6.1.4.1.5962.99.1.2237260787.1662717184.1234892907507.1411.0',
          rows: 128,
          columns: 128,
          rowCosines: [1, 0, 0],
          columnCosines: [0, 1, 0],
          imagePositionPatient: [-297.65625, -297.65625, -395.85000610351],
          rowPixelSpacing: 4.6875,
          columnPixelSpacing: 4.6875
        };
      }
    }
  }

  cornerstone.metaData.addProvider(metaDataProvider);
})(cornerstone);
