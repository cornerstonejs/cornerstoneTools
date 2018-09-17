import ScaleOverlayTool from './ScaleOverlayTool.js';
import external from './../externalModules.js';
import { getNewContext } from '../util/drawing.js';

jest.mock('./../externalModules.js', () => ({
  cornerstone: {
    getEnabledElement: jest.fn(),
    updateImage: jest.fn(),
    metaData: {
      get: jest.fn()
    }
  }
}));
jest.mock('../util/drawing.js', () => ({
  getNewContext: jest.fn()
}));


// TODO: Not sure if this is the best place to test the tool's strategies?
describe('ScaleOverlayTool.js', () => {
  beforeEach(() => {
    console.warn = jest.fn();
    console.warn.mockClear();
  });

  describe('default values', () => {
    it('has a default name of "ScaleOverlay"', () => {
      const defaultName = 'ScaleOverlay';
      const instantiatedTool = new ScaleOverlayTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('can be created with a custom tool name', () => {
      const customToolName = 'customToolName';
      const instantiatedTool = new ScaleOverlayTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName);
    });

    it('sets a default configuration with an minorTickLength as 12.5', () => {
      const instantiatedTool = new ScaleOverlayTool();

      expect(instantiatedTool.configuration.minorTickLength).toBe(12.5);
    });

    it('sets a default configuration with an majorTickLength as 25', () => {
      const instantiatedTool = new ScaleOverlayTool();

      expect(instantiatedTool.configuration.majorTickLength).toBe(25);
    });
  });

  describe('forceImageUpdate', () => {
    it('should call updateImage is image exists', () => {
      external.cornerstone.getEnabledElement.mockReturnValue({ image: {} });
      external.cornerstone.updateImage = jest.fn();

      const instantiatedTool = new ScaleOverlayTool();

      instantiatedTool.forceImageUpdate({});
      expect(external.cornerstone.updateImage).toHaveBeenCalled();
    });

    it('should NOT call updateImage is image does not exists', () => {
      external.cornerstone.getEnabledElement.mockReturnValue({ image: undefined });
      external.cornerstone.updateImage = jest.fn();

      const instantiatedTool = new ScaleOverlayTool();

      instantiatedTool.forceImageUpdate({});
      expect(external.cornerstone.updateImage).not.toHaveBeenCalled();
    });
  });

  describe('disabledCallback', () => {
    it('should call forceImageUpdate', () => {
      const instantiatedTool = new ScaleOverlayTool();

      instantiatedTool.forceImageUpdate = jest.fn();
      instantiatedTool.disabledCallback({});
      expect(instantiatedTool.forceImageUpdate).toHaveBeenCalled();
    });
  });

  describe('enabledCallback', () => {
    it('should call forceImageUpdate', () => {
      const instantiatedTool = new ScaleOverlayTool();

      instantiatedTool.forceImageUpdate = jest.fn();
      instantiatedTool.enabledCallback({});
      expect(instantiatedTool.forceImageUpdate).toHaveBeenCalled();
    });
  });

  describe('renderToolData', () => {
    it('should return if row/collum pixel spacing is undefined', () => {
      const mockEvt = {
        detail: {
          canvasContext: {},
          image: {}
        }
      };
      const instantiatedTool = new ScaleOverlayTool();

      getNewContext.mockReturnValue({});
      external.cornerstone.metaData.get = jest.fn();
      external.cornerstone.metaData.get.mockReturnValue({});

      instantiatedTool.renderToolData(mockEvt);

      expect(console.warn).toHaveBeenCalled();
      expect(console.warn.mock.calls[0][0]).toContain('unable to define rowPixelSpacing or colPixelSpacing from data on ScaleOverlay\'s renderToolData');
    });
  });
});
