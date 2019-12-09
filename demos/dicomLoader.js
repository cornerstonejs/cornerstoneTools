import * as dicomRender from '../../dicom-render/dist/dicomRender.js';
(function (cs) {
  'use strict';

  function loadImage(imageId, dicom) {
    const width = dicom.Columns;
    const height = dicom.Rows;

    function getPixelData() {
      return dicom.PixelData;
    }

    function getDicom () {
      return dicom;
    }

    const image = {
      imageId: imageId,
      minPixelValue: -9999,
      maxPixelValue: 9999,
      slope: 1.0,
      intercept: 0,
      windowCenter: 300,
      windowWidth: 800,
      render: dicomRender.renderGrayscaleImage,
      getPixelData: getPixelData,
      getDicom: getDicom,
      rows: height,
      rgba: true,
      columns: width,
      height: height,
      width: width,
      color: false,
      columnPixelSpacing: dicom.PixelSpacing[1],
      rowPixelSpacing: dicom.PixelSpacing[0],
      invert: false,
      rotation: 0,
      sizeInBytes: width * height * 4,
    };

    return {
      promise: new Promise (resolve => resolve (image)),
      cancelFn: undefined,
    };
  }

  // Register our imageLoader plugin with dicomRender
  cs.registerImageLoader ('dicomLoader', loadImage);
}) (dicomRender);
