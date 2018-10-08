import BaseTool from './BaseTool.js';

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

jest.mock('../import.js', () => ({
  default: jest.fn()
}));

describe('BaseTool.js', () => {
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
