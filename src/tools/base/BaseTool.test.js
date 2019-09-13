import BaseTool from './BaseTool.js';

jest.mock('./../../externalModules.js', () => ({
  cornerstone: {
    colors: {
      getColormap: jest.fn().mockImplementation(() => ({
        setNumberOfColors: jest.fn(),
        setColor: jest.fn(),
      })),
    },
  },
}));

jest.mock('./../../importInternal.js', () => ({
  default: jest.fn(),
}));

describe('BaseTool.js', () => {
  describe('constructor()', () => {
    it('should be instantiated with default mode of "disabled"', () => {
      const instantiatedTool = new BaseTool();

      expect(instantiatedTool.mode).toBe('disabled');
    });

    it('should have default configuration as an empty object', () => {
      const instantiatedTool = new BaseTool();
      const emptyObject = {};

      expect(instantiatedTool.configuration).toEqual(emptyObject);
    });

    it('should be able to set configuration after instantiated', () => {
      const setConfig = {
        mouseButtonMask: 1,
      };
      const instantiatedTool = new BaseTool();

      instantiatedTool.configuration = setConfig;

      const retrievedConfig = instantiatedTool.configuration;

      expect(setConfig).toEqual(retrievedConfig);
    });

    it('should be able to be instantiated with properties', () => {
      const properties = {
        name: 'ToolName',
      };
      const instantiatedTool = new BaseTool(properties);

      expect(instantiatedTool.name).toEqual('ToolName');
    });

    it('should be able to be instantiated and get default properties merged with custom properties', () => {
      const defaultProperties = {
        name: 'ToolName',
        configuration: {
          mouseButtonMask: 1,
          colorShadow: '#fff',
        },
      };

      const properties = {
        name: 'CoolToolName',
        defaultStrategy: 'coolStrategy',
        configuration: {
          mouseButtonMask: 2,
        },
      };
      const instantiatedTool = new BaseTool(properties, defaultProperties);

      const configuration = instantiatedTool.configuration;

      expect(instantiatedTool.name).toEqual('CoolToolName');
      expect(instantiatedTool.defaultStrategy).toEqual('coolStrategy');
      expect(configuration.mouseButtonMask).toEqual(2);
      expect(configuration.colorShadow).toEqual('#fff');
    });
  });

  describe('clearOptions()', () => {
    it('should clear BaseTool options', () => {
      let instanceOptions = {};
      const options = {
        color: '#fff',
      };
      const instantiatedTool = new BaseTool();

      instantiatedTool.mergeOptions(options);
      instanceOptions = instantiatedTool.options;

      expect(instanceOptions.color).toBeDefined();

      instantiatedTool.clearOptions(options);
      instanceOptions = instantiatedTool.options;

      expect(instanceOptions).toEqual({});
    });
  });

  describe('mergeOptions()', () => {
    it('should add options into BaseTool', () => {
      const options = {
        color: '#fff',
      };
      const instantiatedTool = new BaseTool();

      instantiatedTool.mergeOptions(options);
      const instanceOptions = instantiatedTool.options;

      expect(instanceOptions.color).toEqual('#fff');
    });
  });

  describe('applyActiveStrategy()', () => {
    it('should call activeStrategy', () => {
      const coolStrategy = jest.fn();

      const properties = {
        name: 'ToolName',
        strategies: { coolStrategy },
        defaultStrategy: 'coolStrategy',
      };

      const instantiatedTool = new BaseTool(properties);

      instantiatedTool.applyActiveStrategy();

      expect(coolStrategy).toHaveBeenCalled();
    });
  });
});
