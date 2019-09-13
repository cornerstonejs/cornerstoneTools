// NOTE: We pull these in from packaged sources in our header,
// but here are the associated NPM packages that can be used instead

// Packages
// import Hammer from 'hammerjs';
// import dicomParser from 'dicom-parser';
// import * as cornerstone from 'cornerstone-core';
// import * as cornerstoneMath from 'cornerstone-math';
// import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
// import * as cornerstoneTools from '@cornerstonejs/tools';

const baseUrl =
  window.ENVIRONMENT === 'development'
    ? 'http://localhost:4000/'
    : 'https://tools.cornerstonejs.org/examples/';

_initCornerstone();
const element = document.querySelector('.cornerstone-element');
_initInterface();

// Init CornerstoneTools
cornerstoneTools.init(
  {
    showSVGCursors: true,
  }
);

cornerstone.enable(element);
const toolName = '{{ page.toolName }}';
const imageIds = [
  `wadouri:${baseUrl}assets/dicom/exotic/1.dcm`,
  `wadouri:${baseUrl}assets/dicom/exotic/2.dcm`,
];

const stack = {
  currentImageIdIndex: 0,
  imageIds: imageIds,
};

element.tabIndex = 0;
element.focus();

cornerstone.loadImage(imageIds[0]).then(function(image) {
  cornerstoneTools.addStackStateManager(element, ['stack']);
  cornerstoneTools.addToolState(element, 'stack', stack);
  cornerstone.displayImage(element, image);
});

// Add the tool
const apiTool = cornerstoneTools[`${toolName}Tool`];
cornerstoneTools.addTool(apiTool);
cornerstoneTools.setToolActive(toolName, { mouseButtonMask: 1 });

/***************************************************************************
 * UI & Boilerplate setup code
 **************************************************************************/

/***
 *
 *
 */
function _initCornerstone() {
  // Externals
  cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
  cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
  cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
  cornerstoneTools.external.cornerstone = cornerstone;
  cornerstoneTools.external.Hammer = Hammer;

  // Image Loader
  const config = {
    webWorkerPath: `${baseUrl}assets/image-loader/cornerstoneWADOImageLoaderWebWorker.js`,
    taskConfiguration: {
      decodeTask: {
        codecsPath: `${baseUrl}assets/image-loader/cornerstoneWADOImageLoaderCodecs.js`,
      },
    },
  };
  cornerstoneWADOImageLoader.webWorkerManager.initialize(config);
}

const convertMouseEventWhichToButtons = which => {
  switch (which) {
    // no button
    case 0:
      return 0;
    // left
    case 1:
      return 1;
    // middle
    case 2:
      return 4;
    // right
    case 3:
      return 2;
  }
  return 0;
};
