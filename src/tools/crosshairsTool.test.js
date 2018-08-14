import CrosshairsTool from './crosshairsTool.js';


describe('crosshairsTool.js', () => {
  describe('default values', () => {
    it('has a default name of "crosshairs"', () => {
      const defaultName = 'crosshairs';
      const instantiatedTool = new CrosshairsTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('can be created with a custom tool name', () => {
      const customToolName = 'customToolName';
      const instantiatedTool = new CrosshairsTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName);
    });
  });
});

