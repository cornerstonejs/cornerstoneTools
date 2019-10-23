import OrientationMarkersTool from './OrientationMarkersTool.js';
import external from '../externalModules.js';
import { getNewContext } from '../drawing/index.js';
import { getLogger } from '../util/logger.js';

jest.mock('../util/logger.js');
jest.mock('../externalModules.js', () => ({
  cornerstone: {
    getEnabledElement: jest.fn(),
    updateImage: jest.fn(),
    metaData: {
      get: jest.fn(),
    },
  },
}));

jest.mock('../drawing/index.js', () => ({
  getNewContext: jest.fn(),
}));

describe('OrientationMarkersTool.js', () => {
  describe('default values', () => {
    it('has a default name of "OrientationMarkers"', () => {
      const defaultName = 'OrientationMarkers';
      const instantiatedTool = new OrientationMarkersTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('can be created with a custom tool name', () => {
      const customToolName = { name: 'customToolName' };
      const instantiatedTool = new OrientationMarkersTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName.name);
    });

    it('sets a default configuration with a drawAllMarkers as true', () => {
      const instantiatedTool = new OrientationMarkersTool();

      expect(instantiatedTool.configuration.drawAllMarkers).toBe(true);
    });
  });

  describe('forceImageUpdate', () => {
    it('should call updateImage if image exists', () => {
      external.cornerstone.getEnabledElement.mockReturnValue({ image: {} });
      external.cornerstone.updateImage = jest.fn();

      const instantiatedTool = new OrientationMarkersTool();

      instantiatedTool.forceImageUpdate({});
      expect(external.cornerstone.updateImage).toHaveBeenCalled();
    });

    it('should NOT call updateImage if image does not exists', () => {
      external.cornerstone.getEnabledElement.mockReturnValue({
        image: undefined,
      });
      external.cornerstone.updateImage = jest.fn();

      const instantiatedTool = new OrientationMarkersTool();

      instantiatedTool.forceImageUpdate({});
      expect(external.cornerstone.updateImage).not.toHaveBeenCalled();
    });
  });

  describe('disabledCallback', () => {
    it('should call forceImageUpdate', () => {
      const instantiatedTool = new OrientationMarkersTool();

      instantiatedTool.forceImageUpdate = jest.fn();
      instantiatedTool.disabledCallback({});
      expect(instantiatedTool.forceImageUpdate).toHaveBeenCalled();
    });
  });

  describe('enabledCallback', () => {
    it('should call forceImageUpdate', () => {
      const instantiatedTool = new OrientationMarkersTool();

      instantiatedTool.forceImageUpdate = jest.fn();
      instantiatedTool.enabledCallback({});
      expect(instantiatedTool.forceImageUpdate).toHaveBeenCalled();
    });
  });
});
