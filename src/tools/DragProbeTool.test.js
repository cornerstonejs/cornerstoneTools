import DragProbeTool from './DragProbeTool.js';

describe('DragProbeTool.js', () => {

  describe('default values', () => {
    it('has a default name of "DragProbe"', () => {
      const defaultName = 'DragProbe';
      const instantiatedTool = new DragProbeTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('can be created with a custom tool name', () => {
      const customToolName = 'customToolName';
      const instantiatedTool = new DragProbeTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName);
    });
  });
});
