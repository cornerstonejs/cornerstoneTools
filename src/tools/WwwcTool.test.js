import WwwcTool from './WwwcTool.js';
import external from './../externalModules.js';

jest.mock('./../externalModules.js', () => ({
  cornerstone: {
    setViewport: jest.fn(),
  },
}));

// TODO: Not sure if this is the best place to test the tool's strategies?
describe('WwwcTool.js', () => {
  describe('default values', () => {
    it('has a default name of "Wwwc"', () => {
      const defaultName = 'Wwwc';
      const instantiatedTool = new WwwcTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('can be created with a custom tool name', () => {
      const customToolName = { name: 'customToolName' };
      const instantiatedTool = new WwwcTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName.name);
    });

    it('sets a default configuration with an orientation of 0', () => {
      const instantiatedTool = new WwwcTool();

      expect(instantiatedTool.configuration.orientation).toBe(0);
    });

    it('uses "basicLevelingStrategy" as a default strategy', () => {
      const instantiatedTool = new WwwcTool();

      expect(instantiatedTool.defaultStrategy).toEqual('basicLevelingStrategy');
    });
  });

  it('mouseDragCallback applies the active strategy', () => {
    const mockEvt = {
      detail: {
        element: jest.fn(),
        viewport: jest.fn(),
      },
    };
    const instantiatedTool = new WwwcTool();

    instantiatedTool.applyActiveStrategy = jest.fn();
    instantiatedTool.mouseDragCallback(mockEvt);

    expect(instantiatedTool.applyActiveStrategy).toHaveBeenCalled();
  });

  it('mouseDragCallback updates the viewport', () => {
    const mockEvt = {
      detail: {
        element: jest.fn(),
        viewport: jest.fn(),
      },
    };
    const instantiatedTool = new WwwcTool();

    instantiatedTool.applyActiveStrategy = jest.fn();
    instantiatedTool.mouseDragCallback(mockEvt);

    expect(external.cornerstone.setViewport).lastCalledWith(
      mockEvt.detail.element,
      mockEvt.detail.viewport
    );
  });

  it('touchDragCallback applies the active strategy', () => {
    const mockEvt = {
      stopImmediatePropagation: jest.fn(),
      detail: {
        element: jest.fn(),
        viewport: jest.fn(),
      },
    };
    const instantiatedTool = new WwwcTool();

    instantiatedTool.applyActiveStrategy = jest.fn();
    instantiatedTool.touchDragCallback(mockEvt);

    expect(instantiatedTool.applyActiveStrategy).toHaveBeenCalled();
  });

  it('touchDragCallback updates the viewport', () => {
    const mockEvt = {
      stopImmediatePropagation: jest.fn(),
      detail: {
        element: jest.fn(),
        viewport: jest.fn(),
      },
    };
    const instantiatedTool = new WwwcTool();

    instantiatedTool.applyActiveStrategy = jest.fn();
    instantiatedTool.touchDragCallback(mockEvt);

    expect(external.cornerstone.setViewport).lastCalledWith(
      mockEvt.detail.element,
      mockEvt.detail.viewport
    );
  });
});
