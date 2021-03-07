import { getModule } from '../store/index.js';
import onImageRenderedBrushEventHandler from './onImageRenderedBrushEventHandler.js';
import { addToolState } from '../stateManagement/toolState';
import externalModules from '../externalModules.js';
import triggerEvent from '../util/triggerEvent.js';
import getLabelmaps3D from '../store/modules/segmentationModule/getLabelmaps3D.js';

const segmentationModule = getModule('segmentation');
const { configuration, state } = segmentationModule;

jest.mock('./../externalModules.js');
jest.mock('./internals/renderSegmentation.js');
jest.mock('../util/triggerEvent.js');
jest.mock('../store/modules/segmentationModule/getLabelmaps3D.js');

let evt;

function createLabelMap(width, length, currentImageIdIndex) {
  let labelmap3D = {
    buffer: new ArrayBuffer(length * 2),
    labelmaps2D: [],
    metadata: [],
    activeSegmentIndex: 0,
    segmentsHidden: [],
  };

  let labelmap2D = {
    pixelData: new Uint16Array(labelmap3D.buffer, 0, length),
    segmentsOnLabelmap: [0, 1, 2],
  };

  const pixelData = labelmap2D.pixelData;
  const cols = width;

  // Add segment 1 as an L shape, so should have 1 interior corner.
  pixelData[64 * cols + 64] = 1;
  pixelData[65 * cols + 64] = 1;
  pixelData[65 * cols + 65] = 1;

  // Add segment 2 as a rectangle.
  for (let x = 201; x <= 210; x++) {
    pixelData[200 * cols + x] = 2;
    pixelData[201 * cols + x] = 2;
  }

  labelmap3D.labelmaps2D[currentImageIdIndex] = labelmap2D;

  return labelmap3D;
}

function initalize() {
  const width = 256;
  const length = width * width;
  const currentImageIdIndex = 0;
  const labelmaps3D = [];
  const canvasScale = 1.0;

  let eventData = {
    element: null,
    image: {
      width: 256,
      height: 256,
    },
    viewport: {
      rotation: 0,
      scale: canvasScale,
      translation: { x: 0, y: 0 },
      hflip: false,
      vflip: false,
      displayedArea: {
        brhc: { x: 256, y: 256 },
        tlhc: { x: 1, y: 1 },
      },
    },
    canvasContext: {
      canvas: {
        width: canvasScale * width,
        height: canvasScale * width,
      },
    },
  };

  evt = {
    detail: eventData,
  };
  labelmaps3D.push(
    createLabelMap(eventData.image.width, length, currentImageIdIndex)
  );
  labelmaps3D.push(
    createLabelMap(eventData.image.width, length, currentImageIdIndex)
  );
  const imageIds = ['image1'];
  const stack = {
    currentImageIdIndex: 0,
    imageIds: imageIds,
  };

  const imageId = 'image1';
  const testElement = {
    image: {
      imageId,
    },
  };

  state.series['image1'] = {
    activeLabelmapIndex: 0,
    labelmaps3D: labelmaps3D,
    currentImageIdIndex: currentImageIdIndex,
  };

  externalModules.cornerstone.getEnabledElement.mockImplementationOnce(
    () => testElement
  );
  triggerEvent.mockImplementationOnce(() => true);
  getLabelmaps3D.mockImplementationOnce(() => state.series['image1']);

  const stackState = addToolState(testElement, 'stack', stack);
}

describe('onImageRenderedBrushEventHandler.js', () => {
  beforeEach(() => {
    initalize();
  });

  describe('renderInactiveLabelMaps', () => {
    it('Should keep fillAlphaInactive set directly', () => {
      configuration.fillAlphaPerLabelMap = {};
      configuration.fillAlphaInactive = 0.5;
      const outline = onImageRenderedBrushEventHandler(evt);

      expect(configuration.fillAlphaInactive).toBe(0.5);
    });
    it('Should update fillAlpha and fillAlphaInactive from fillAlphaPerLabelMap', () => {
      configuration.fillAlphaPerLabelMap['image1'] = [0.8, 0.9];
      configuration.fillAlpha = 0.2;
      configuration.fillAlphaInactive = 0.5;
      const outline = onImageRenderedBrushEventHandler(evt);

      expect(configuration.fillAlpha).toBe(0.8);
      expect(configuration.fillAlphaInactive).toBe(0.9);
    });
  });
  describe('renderActiveLabelMap', () => {
    it('Should keep fillAlpha set directly', () => {
      configuration.fillAlphaPerLabelMap = {};
      configuration.fillAlpha = 0.6;
      const outline = onImageRenderedBrushEventHandler(evt);

      expect(configuration.fillAlpha).toBe(0.6);
    });
    it('Should update fillAlpha and fillAlphaInactive from fillAlphaPerLabelMap', () => {
      configuration.fillAlphaPerLabelMap['image1'] = [0.4, 1.0];
      configuration.fillAlpha = 0.5;
      configuration.fillAlphaInactive = 0.6;
      const outline = onImageRenderedBrushEventHandler(evt);

      expect(configuration.fillAlpha).toBe(0.4);
      expect(configuration.fillAlphaInactive).toBe(1.0);
    });
  });
});
