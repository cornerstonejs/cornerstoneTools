import CorrectionScissorsTool from './CorrectionScissorsTool';

describe('CorrectionScissorsTool.js', () => {
  describe('Initialization', () => {
    it('Instantiate CorrectionScissorsTool Correctly', () => {
      const defaultName = 'CorrectionScissors';
      const instantiatedTool = new CorrectionScissorsTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('allows a custom name', () => {
      const customToolName = { name: 'CustomScissorsName' };
      const instantiatedTool = new CorrectionScissorsTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName.name);
    });
  });
});
