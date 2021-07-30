import CircleScissorsTool from './CircleScissorsTool';

describe('CircleScissorsTool.js', () => {
  describe('Initialization', () => {
    it('Instantiate CircleScissorsTool Correctly', () => {
      const defaultName = 'CircleScissors';
      const instantiatedTool = new CircleScissorsTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('allows a custom name', () => {
      const customToolName = { name: 'CustomScissorsName' };
      const instantiatedTool = new CircleScissorsTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName.name);
    });
  });
});
