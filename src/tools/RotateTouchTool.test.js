import RotateTouchTool from './RotateTouchTool.js';
import external from './../externalModules.js';

jest.mock('./../externalModules.js', () => ({
  cornerstone: {
    setViewport: jest.fn(),
  },
}));

const mockEvt = {
  detail: {
    element: {},
    rotation: 50,
    viewport: {
      rotation: 30,
    },
  },
};

describe('RotateTouchTool.js', () => {
  describe('default values', () => {
    it('has a default name of "RotateTouch"', () => {
      const defaultName = 'RotateTouch';
      const instantiatedTool = new RotateTouchTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('can be created with a custom tool name', () => {
      const customToolName = { name: 'customToolName' };
      const instantiatedTool = new RotateTouchTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName.name);
    });
  });

  describe('touchRotateCallback', () => {
    it('should call setViewport with the correct rotation set by touch event', () => {
      const instantiatedTool = new RotateTouchTool();

      external.cornerstone.setViewport = jest.fn();

      instantiatedTool.touchRotateCallback(mockEvt);
      expect(external.cornerstone.setViewport).toHaveBeenCalledWith(
        {},
        { rotation: 80 }
      );
    });
  });
});
