import CrosshairTool from './crosshairTool.js';


describe('crosshairTool.js', () => {
  describe('default values', () => {
    it('has a default name of "crosshair"', () => {
      const defaultName = 'crosshair';
      const instantiatedTool = new CrosshairTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('can be created with a custom tool name', () => {
      const customToolName = 'customToolName';
      const instantiatedTool = new CrosshairTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName);
    });
  });
});

