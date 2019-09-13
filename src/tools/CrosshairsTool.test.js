import CrosshairsTool from './CrosshairsTool.js';

describe('CrosshairsTool.js', () => {
  describe('default values', () => {
    it('has a default name of "Crosshairs"', () => {
      const defaultName = 'Crosshairs';
      const instantiatedTool = new CrosshairsTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('can be created with a custom tool name', () => {
      const customToolName = { name: 'customToolName' };
      const instantiatedTool = new CrosshairsTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName.name);
    });
  });
});
