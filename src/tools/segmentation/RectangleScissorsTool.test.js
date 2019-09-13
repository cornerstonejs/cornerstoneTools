import RectangleScissorsTool from './RectangleScissorsTool';

jest.mock('./../../externalModules.js');

describe('RectangleScissorsTool.js', () => {
  describe('Initialization', () => {
    it('Instantiate RectangleScissorsTool Correctly', () => {
      const defaultName = 'RectangleScissors';
      const instantiatedTool = new RectangleScissorsTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('allows a custom name', () => {
      const customToolName = { name: 'CustomScissorsName' };
      const instantiatedTool = new RectangleScissorsTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName.name);
    });
  });
});
