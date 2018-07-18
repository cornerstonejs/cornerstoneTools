import WwwcMouse from './wwwcMouse.js';

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
});
