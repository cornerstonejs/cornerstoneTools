import LengthMouse from './lengthMouse.js';

jest.mock('./../../manipulators/drawHandles.js');
jest.mock('./../../util/drawing.js');

describe('lengthMouse.js', () => {
  it('has a default name of "lengthMouse"', () => {
    const defaultName = 'lengthMouse';
    const instantiatedTool = new LengthMouse();

    expect(instantiatedTool.name).toEqual(defaultName);
  });

  it('can be created with a custom tool name', () => {
    const customToolName = 'customToolName';
    const instantiatedTool = new LengthMouse(customToolName);

    expect(instantiatedTool.name).toEqual(customToolName);
  });

  it('is a mouse tool', () => {
    const instantiatedTool = new LengthMouse();

    expect(instantiatedTool.isMouseTool).toBe(true);
  });
});
