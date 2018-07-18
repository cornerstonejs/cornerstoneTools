import WwwcMouse from './wwwcMouse.js';
import external from './../../externalModules.js';

jest.mock('./../../externalModules.js', () => ({
  cornerstone: {
    setViewport: jest.fn()
  }
}));

describe('wwwcMouse.js', () => {
  it('has a default name of "wwwcMouse"', () => {
    const defaultName = 'wwwcMouse';
    const instantiatedTool = new WwwcMouse();

    expect(instantiatedTool.name).toEqual(defaultName);
  });

  it('can be created with a custom tool name', () => {
    const customToolName = 'customToolName';
    const instantiatedTool = new WwwcMouse(customToolName);

    expect(instantiatedTool.name).toEqual(customToolName);
  });

  it('is a mouse tool', () => {
    const instantiatedTool = new WwwcMouse();

    expect(instantiatedTool.isMouseTool).toBe(true);
  });

  it('mouseDragCallback applies the active strategy', () => {
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

  it('mouseDragCallback updates the viewport', () => {
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
