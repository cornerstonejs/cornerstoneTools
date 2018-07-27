import WwwcRegionTool from './wwwcRegionTool.js';

describe('wwwcRegionTool.js', () => {
  describe('default values', () => {
    it('has a default name of "wwwcRegion"', () => {
      const defaultName = 'wwwcRegion';
      const instantiatedTool = new WwwcRegionTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('can be created with a custom tool name', () => {
      const customToolName = 'customToolName';
      const instantiatedTool = new WwwcRegionTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName);
    });

    it('sets a default configuration with an orientation of 0', () => {
      const instantiatedTool = new WwwcRegionTool();

      expect(instantiatedTool.configuration.orientation).toBe(0);
    });
  });
});
