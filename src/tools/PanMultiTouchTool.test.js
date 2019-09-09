/* eslint no-underscore-dangle: 0 */
import PanMultiTouchTool from './PanMultiTouchTool.js';
import external from './../externalModules.js';

jest.mock('./../externalModules.js', () => ({
  cornerstone: {},
}));

describe('PanMultiTouchTool.js', () => {
  describe('default values', () => {
    it('has a default name of "PanMultiTouch"', () => {
      const defaultName = 'PanMultiTouch';
      const instantiatedTool = new PanMultiTouchTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });
    it('can be created with a custom tool name', () => {
      const customToolName = { name: 'customToolName' };
      const instantiatedTool = new PanMultiTouchTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName.name);
    });
  });
  describe("Interaction's behavior", () => {
    let instantiatedTool;
    let goodMockEvt;

    beforeEach(() => {
      instantiatedTool = new PanMultiTouchTool();
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
          numPointers: 2,
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
      instantiatedTool.multiTouchDragCallback(goodMockEvt);
      expect(external.cornerstone.setViewport).toHaveBeenCalled();
    });
    it('should set the viewport properly with mock data and column bigger than row pixel spacing', () => {
      goodMockEvt.detail.image = {
        columnPixelSpacing: 10,
        rowPixelSpacing: 5,
      };
      instantiatedTool.multiTouchDragCallback(goodMockEvt);
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
      instantiatedTool.multiTouchDragCallback(goodMockEvt);
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
