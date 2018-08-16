(function (cs) {
  'use strict';

  function createTextPixelData (l, bg) {
    bg = bg === undefined ? '#222' : bg;
    const canvas = document.createElement('canvas');

    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 256, 256);
    ctx.font = '48px courier';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'white';
    ctx.strokeText('' + l, 50, 100);
    const RgbaPixelData = ctx.getImageData(0, 0, 256, 256).data;
    const RedPiexelData = RgbaPixelData.filter((p, i) => i % 4 === 0);

    return RedPiexelData;
  }

  // ImageId should be // example-n://<label>:<bg-color>
  function getTextImage (imageId) {
    const width = 256;
    const height = 256;

    const tokens = imageId.substring(12).split(':');
    const l = tokens[0];
    const bg = tokens[1];
    const pixelData = createTextPixelData(l, bg);

    function getPixelData () {
      return pixelData;
    }

    const image = {
      imageId,
      minPixelValue: 0,
      maxPixelValue: 257,
      slope: 1.0,
      intercept: 0,
      windowCenter: 127,
      windowWidth: 256,
      render: cs.renderGrayscaleImage,
      getPixelData,
      rows: height,
      columns: width,
      height,
      width,
      color: false,
      columnPixelSpacing: 1.0,
      rowPixelSpacing: 1.0,
      invert: false,
      sizeInBytes: width * height
    };

    return {
      promise: new Promise((resolve) => {
        resolve(image);
      }),
      cancelFn: undefined
    };
  }

  // Register our imageLoader plugin with cornerstone
  cs.registerImageLoader('example-n', getTextImage);
})(cornerstone);
