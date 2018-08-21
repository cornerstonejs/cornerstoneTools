import DragProbeTool from './dragProbeTool.js';

describe('dragProbeTool.js', () => {

  describe('default values', () => {
    it('has a default name of "dragProbe"', () => {
      const defaultName = 'dragProbe';
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
