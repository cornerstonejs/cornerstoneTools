import LengthTouch from './lengthTouch.js';

jest.mock('./../../manipulators/drawHandles.js');
jest.mock('./../../util/drawing.js');

describe('lengthTouch.js', () => {
  it('has a default name of "lengthTouch"', () => {
    const defaultName = 'lengthTouch';
    const instantiatedTool = new LengthTouch();

    expect(instantiatedTool.name).toEqual(defaultName);
  });

  it('can be created with a custom tool name', () => {
    const customToolName = 'customToolName';
    const instantiatedTool = new LengthTouch(customToolName);

    expect(instantiatedTool.name).toEqual(customToolName);
  });

  it('is a touch tool', () => {
    const instantiatedTool = new LengthTouch();

    expect(instantiatedTool.isTouchTool).toBe(true);
  });
});
