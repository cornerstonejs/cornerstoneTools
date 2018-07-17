import WwwcMouse from './wwwcMouse.js';
import external from './../externalModules.js';

jest.mock('./../externalModules.js', () => ({
  cornerstone: {
    setViewport: jest.fn()
  }
}));

// TODO: Not sure if this is the best place to test the tool's strategies?
describe('wwwcMouse.js', () => {
  describe('default values', () => {
    it('has a default name of "wwwcMouse"', () => {
      const instantiatedTool = new WwwcMouse();

      expect(instantiatedTool.name).toEqual('wwwcMouse');
    });

    it('uses "basicLevelingStrategy" as a default strategy', () => {
      const instantiatedTool = new WwwcMouse();

      expect(instantiatedTool.defaultStrategy).toEqual('basicLevelingStrategy');
    });
  });

  it('calls `applyActiveStrategy` in mouseDragCallback', () => {
    const mockEvt = {
      detail: {
        element: jest.fn(),
        viewport: jest.fn()
      }
    };
    const instantiatedTool = new WwwcMouse();

    instantiatedTool.applyActiveStrategy = jest.fn();
    instantiatedTool.mouseDragCallback(mockEvt);

    expect(instantiatedTool.applyActiveStrategy).toHaveBeenCalled();
  });

  it('calls `cornerstone`\'s setViewport with an updated viewport', () => {
    const mockEvt = {
      detail: {
        element: jest.fn(),
        viewport: jest.fn()
      }
    };
    const instantiatedTool = new WwwcMouse();

    instantiatedTool.applyActiveStrategy = jest.fn();
    instantiatedTool.mouseDragCallback(mockEvt);

    expect(external.cornerstone.setViewport).lastCalledWith(
      mockEvt.detail.element,
      mockEvt.detail.viewport
    );
  });
});
