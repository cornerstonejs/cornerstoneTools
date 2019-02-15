(function (cornerstone) {
  'use strict';

  function metaDataProvider (type, imageId) {
    if (type === 'imagePlaneModule') {
      if (imageId.startsWith('example-n')) {
        const tokens = imageId.substring(12).split(':');
        const n = Number(tokens[0]);
        const z = window.isNaN(n) ? 0 : n;

        return {
          frameOfReferenceUID: '1.2.3.4.5',
          rows: 256,
          columns: 256,
          rowCosines: [0, 1, 0],
          columnCosines: [0, 0, -1],
          imagePositionPatient: [-9.4, -92.5, z],
          columnPixelSpacing: 0.78,
          rowPixelSpacing: 0.78
        };
      }
    }
  }

  cornerstone.metaData.addProvider(metaDataProvider);
})(cornerstone);
