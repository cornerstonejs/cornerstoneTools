import DoubleTapZoomTool from './doubleTapZoomTool';
import external from '../externalModules.js';

jest.mock('../externalModules.js', () => ({
  cornerstone: {
    fitToWindow: jest.fn()
  }
}));

const mockEvt = {
  detail: {}
};

describe('doubleTapZoomTool.js', () => {
  describe('default values', () => {
    it('has a default name of "doubleTapZoom"', () => {
      const defaultName = 'doubleTapZoom';
      const instantiatedTool = new DoubleTapZoomTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('can be created with a custom tool name', () => {
      const customToolName = 'customToolName';
      const instantiatedTool = new DoubleTapZoomTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName);
    });
  });

  describe('doubleTapCallback', () => {
    it('should fitToWindow once double tap event happens', () => {
      const instantiatedTool = new DoubleTapZoomTool();

      external.cornerstone.fitToWindow.mockClear();
      instantiatedTool.doubleTapCallback(mockEvt);

      expect(external.cornerstone.fitToWindow).toHaveBeenCalled();
    });
  });
});
