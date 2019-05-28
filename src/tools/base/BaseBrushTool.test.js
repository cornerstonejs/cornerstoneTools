import BaseBrushTool from './BaseBrushTool.js';

describe('BaseBrushTool.js', () => {
  describe('constructor()', function() {
    it('should have referencedToolData as brush', () => {
      const brushTool = new BaseBrushTool();

      const configuration = brushTool.configuration;

      expect(configuration.referencedToolData).toEqual('brush');
    });
  });
});
