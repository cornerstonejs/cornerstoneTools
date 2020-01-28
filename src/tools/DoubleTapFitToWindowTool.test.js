import DoubleTapFitToWindowTool from './DoubleTapFitToWindowTool.js';
import external from '../externalModules.js';

jest.mock('../externalModules.js', () => ({
  cornerstone: {
    fitToWindow: jest.fn(),
  },
}));

const mockEvt = {
  detail: {},
};

describe('DoubleTapFitToWindowTool.js', () => {
  describe('default values', () => {
    it('has a default name of "DoubleTapFitToWindow"', () => {
      const defaultName = 'DoubleTapFitToWindow';
      const instantiatedTool = new DoubleTapFitToWindowTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('can be created with a custom tool name', () => {
      const customToolName = { name: 'customToolName' };
      const instantiatedTool = new DoubleTapFitToWindowTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName.name);
    });
  });

  describe('doubleTapCallback', () => {
    it('should fitToWindow once double tap event happens', () => {
      const instantiatedTool = new DoubleTapFitToWindowTool();

      external.cornerstone.fitToWindow.mockClear();
      instantiatedTool.doubleTapCallback(mockEvt);

      expect(external.cornerstone.fitToWindow).toHaveBeenCalled();
    });
  });
});
