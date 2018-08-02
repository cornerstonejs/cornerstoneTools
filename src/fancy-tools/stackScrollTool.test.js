import StackScrollTool from './stackScrollTool.js';

describe('stachScroll.js', () => {
  describe('default values', () => {
    it('has a default name of "stackScroll"', () => {
      const defaultName = 'stackScroll';
      const instantiatedTool = new StackScrollTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('can be created with a custom tool name', () => {
      const customToolName = 'customToolName';
      const instantiatedTool = new StackScrollTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName);
    });
  });
});
