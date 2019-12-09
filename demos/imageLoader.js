import * as dicomRender from '@sk/dicom-render';
(function (cs) {
  'use strict';

  function loadImage(imageId, imgData) {
    function getImage() {
      return imgData;
    }
    const image = {
      imageId: imageId,
      minPixelValue: -9999,
      maxPixelValue: 9999,
      slope: 1.0,
      intercept: 0,
      getImage: getImage,
      getPixelData: getImage,
      render: dicomRender.renderWebImage,
      rgba: true,
      height: imgData.height,
      width: imgData.width,
      color: true,
      columnPixelSpacing: 1.0,
      rowPixelSpacing: 1.0,
      invert: false,
    };

    return {
      promise: new Promise (resolve => resolve (image)),
      cancelFn: undefined,
    };
  }

  // Register our imageLoader plugin with dicomRender
  cs.registerImageLoader ('imageLoader', loadImage);
}) (dicomRender);
