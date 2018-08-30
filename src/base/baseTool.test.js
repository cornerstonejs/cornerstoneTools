import BaseTool from './baseTool.js';

jest.mock('./../externalModules.js', () => ({
  cornerstone: {
    colors: {
      getColormap: jest.fn().mockImplementation(() => {
        return {
          setNumberOfColors: jest.fn(),
          setColor: jest.fn()
        }
      })
    }
  }
}));

describe('baseTool.js', () => {
  describe('default values', () => {
    it('has a default mode of "disabled"', () => {
      const instantiatedTool = new BaseTool();

      expect(instantiatedTool.mode).toBe('disabled');
    });

    it('s default configuration is an empty object', () => {
      const instantiatedTool = new BaseTool();
      const emptyObject = {};

      expect(instantiatedTool.configuration).toEqual(emptyObject);
    });
  });

  it('can get set configuration', () => {
    const setConfig = {
      mouseButtonMask: 1
    };
    const instantiatedTool = new BaseTool();

    instantiatedTool.configuration = setConfig;

    const retrievedConfig = instantiatedTool.configuration;

    expect(setConfig).toEqual(retrievedConfig);
  });
});
