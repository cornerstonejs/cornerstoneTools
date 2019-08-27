import FreehandScissorsTool from './FreehandScissorsTool';

describe('FreehandScissorsTool.js', () => {
  describe('Initialization', () => {
    it('Instantiate FreehandScissorsTool Correctly', () => {
      const defaultName = 'FreehandScissors';
      const instantiatedTool = new FreehandScissorsTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('allows a custom name', () => {
      const customToolName = { name: 'CustomScissorsName' };
      const instantiatedTool = new FreehandScissorsTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName.name);
    });
  });
});
