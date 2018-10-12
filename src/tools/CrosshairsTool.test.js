import CrosshairsTool from './CrosshairsTool.js';

jest.mock('../import.js', () => ({
  default: jest.fn()
}));

describe('CrosshairsTool.js', () => {
  describe('default values', () => {
    it('has a default name of "Crosshairs"', () => {
      const defaultName = 'Crosshairs';
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
