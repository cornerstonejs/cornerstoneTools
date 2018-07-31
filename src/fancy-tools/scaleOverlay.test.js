import ScaleOverlayTool from './scaleOverlay.js';
import external from './../externalModules.js';

jest.mock('./../externalModules.js', () => ({
  cornerstone: {
    setViewport: jest.fn()
  }
}));

// TODO: Not sure if this is the best place to test the tool's strategies?
describe('scaleOverlay.js', () => {
  describe('default values', () => {
    it('has a default name of "scaleOverlayTool"', () => {
      const defaultName = 'scaleOverlayTool';
      const instantiatedTool = new ScaleOverlayTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('can be created with a custom tool name', () => {
      const customToolName = 'customToolName';
      const instantiatedTool = new ScaleOverlayTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName);
    });

    /**
    It('sets a default configuration with an orientation of 0', () => {
      const instantiatedTool = new ScaleOverlayTool();

      expect(instantiatedTool.configuration.orientation).toBe(0);
    });

    it('uses "basicLevelingStrategy" as a default strategy', () => {
      const instantiatedTool = new ScaleOverlayTool();

      expect(instantiatedTool.defaultStrategy).toEqual('basicLevelingStrategy');
    });
     */
  });

  /**
  It('mouseDragCallback applies the active strategy', () => {
    const mockEvt = {
      detail: {
        element: jest.fn(),
        viewport: jest.fn()
      }
    };
    const instantiatedTool = new ScaleOverlayTool();

    instantiatedTool.applyActiveStrategy = jest.fn();
    instantiatedTool.mouseDragCallback(mockEvt);

    expect(instantiatedTool.applyActiveStrategy).toHaveBeenCalled();
  });
  */

});
