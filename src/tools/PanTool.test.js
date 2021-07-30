import PanTool from './PanTool.js';
import external from './../externalModules.js';

jest.mock('./../externalModules.js', () => ({
  cornerstone: {},
}));

describe('PanTool.js', () => {
  describe('default values', () => {
    it('has a default name of "Pan"', () => {
      const defaultName = 'Pan';
      const instantiatedTool = new PanTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('can be created with a custom tool name', () => {
      const customToolName = { name: 'customToolName' };
      const instantiatedTool = new PanTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName.name);
    });
  });

  describe("Interaction's behavior", () => {
    let instantiatedTool;
    let goodMockEvt;

    beforeEach(() => {
      instantiatedTool = new PanTool();
      external.cornerstone.setViewport = jest.fn();
      external.cornerstone.setViewport.mockClear();

      goodMockEvt = {
        detail: {
          element: {},
          viewport: {
            scale: 2,
            translation: {
              x: 0,
              y: 0,
            },
          },
          image: {},
          deltaPoints: {
            page: {
              x: 512,
              y: 512,
            },
          },
        },
      };
    });

    it('should update viewport once mouse drag event', function() {
      instantiatedTool._getTranslation = jest.fn();
      instantiatedTool._applyTranslation = jest.fn();
      instantiatedTool.mouseDragCallback(goodMockEvt);

      expect(external.cornerstone.setViewport).toHaveBeenCalled();
    });

    it('should update viewport once touch drag event', function() {
      instantiatedTool._getTranslation = jest.fn();
      instantiatedTool._applyTranslation = jest.fn();
      instantiatedTool.touchDragCallback(goodMockEvt);

      expect(external.cornerstone.setViewport).toHaveBeenCalled();
    });

    it('should set the viewport properly with mock data and column bigger than row pixel spacing', () => {
      goodMockEvt.detail.image = {
        columnPixelSpacing: 10,
        rowPixelSpacing: 5,
      };
      instantiatedTool.mouseDragCallback(goodMockEvt);
      const expectedViewport = {
        scale: 2,
        translation: {
          x: 128,
          y: 256,
        },
      };

      expect(external.cornerstone.setViewport).toHaveBeenCalledWith(
        {},
        expectedViewport
      );
    });

    it('should set the viewport properly with mock data row bigger than column pixel spacing', () => {
      goodMockEvt.detail.image = {
        columnPixelSpacing: 5,
        rowPixelSpacing: 10,
      };

      instantiatedTool.mouseDragCallback(goodMockEvt);
      const expectedViewport = {
        scale: 2,
        translation: {
          x: 256,
          y: 128,
        },
      };

      expect(external.cornerstone.setViewport).toHaveBeenCalledWith(
        {},
        expectedViewport
      );
    });
  });
});
