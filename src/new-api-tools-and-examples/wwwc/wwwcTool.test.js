import WwwcTool from './wwwcTool.js';

// TODO: Not sure if this is the best place to test the tool's strategies?
describe('wwwcTool.js', () => {
  describe('default values', () => {
    it('sets a default configuration with an orientation of 0', () => {
      const instantiatedTool = new WwwcTool();

      expect(instantiatedTool.configuration.orientation).toBe(0);
    });

    it('uses "basicLevelingStrategy" as a default strategy', () => {
      const instantiatedTool = new WwwcTool();

      expect(instantiatedTool.defaultStrategy).toEqual('basicLevelingStrategy');
    });
  });
});
