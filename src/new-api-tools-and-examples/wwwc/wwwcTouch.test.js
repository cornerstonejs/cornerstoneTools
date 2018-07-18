import WwwcTouch from './wwwcTouch.js';
import external from './../../externalModules.js';

jest.mock('./../../externalModules.js', () => ({
  cornerstone: {
    setViewport: jest.fn()
  }
}));

describe('wwwcTouch.js', () => {
  it('has a default name of "wwwcTouch"', () => {
    const defaultName = 'wwwcTouch';
    const instantiatedTool = new WwwcTouch();

    expect(instantiatedTool.name).toEqual(defaultName);
  });

  it('can be created with a custom tool name', () => {
    const customToolName = 'customToolName';
    const instantiatedTool = new WwwcTouch(customToolName);

    expect(instantiatedTool.name).toEqual(customToolName);
  });

  it('is a touch tool', () => {
    const instantiatedTool = new WwwcTouch();

    expect(instantiatedTool.isTouchTool).toBe(true);
  });

  it('touchDragCallback applies the active strategy', () => {
    const mockEvt = {
      stopImmediatePropagation: jest.fn(),
      detail: {
        element: jest.fn(),
        viewport: jest.fn()
      }
    };
    const instantiatedTool = new WwwcTouch();

    instantiatedTool.applyActiveStrategy = jest.fn();
    instantiatedTool.touchDragCallback(mockEvt);

    expect(instantiatedTool.applyActiveStrategy).toHaveBeenCalled();
  });

  it('touchDragCallback updates the viewport', () => {
    const mockEvt = {
      stopImmediatePropagation: jest.fn(),
      detail: {
        element: jest.fn(),
        viewport: jest.fn()
      }
    };
    const instantiatedTool = new WwwcTouch();

    instantiatedTool.applyActiveStrategy = jest.fn();
    instantiatedTool.touchDragCallback(mockEvt);

    expect(external.cornerstone.setViewport).lastCalledWith(
      mockEvt.detail.element,
      mockEvt.detail.viewport
    );
  });
});
