import WwwcRegionTool from './WwwcRegionTool.js';

describe('WwwcRegionTool.js', () => {
  describe('default values', () => {
    it('has a default name of "WwwcRegion"', () => {
      const defaultName = 'WwwcRegion';
      const instantiatedTool = new WwwcRegionTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('can be created with a custom tool name', () => {
      const customToolName = { name: 'customToolName' };
      const instantiatedTool = new WwwcRegionTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName.name);
    });

    it('sets a default configuration with an minWindowWidth of 10', () => {
      const instantiatedTool = new WwwcRegionTool();

      expect(instantiatedTool.configuration.minWindowWidth).toBe(10);
    });

    it('sets a default handles with and empty object for each start and end', () => {
      const instantiatedTool = new WwwcRegionTool();

      expect(instantiatedTool.handles.start).toMatchObject({});
      expect(instantiatedTool.handles.end).toMatchObject({});
    });
  });
});
