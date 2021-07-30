import StackScrollMouseWheelTool from './StackScrollMouseWheelTool.js';
import scroll from '../util/scroll.js';

jest.mock('../util/scroll.js');

const mockEvent = {
  detail: {
    direction: 1,
    element: {},
  },
};

describe('StachScrollMouseWheelTool.js', () => {
  describe('default values', () => {
    it('has a default name of "StackScrollMouseWheel"', () => {
      const defaultName = 'StackScrollMouseWheel';
      const instantiatedTool = new StackScrollMouseWheelTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('can be created with a custom tool name', () => {
      const customToolName = { name: 'customToolName' };
      const instantiatedTool = new StackScrollMouseWheelTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName.name);
    });

    it('should have default configuration loop as false', () => {
      const instantiatedTool = new StackScrollMouseWheelTool();

      expect(instantiatedTool.configuration.loop).toEqual(false);
    });

    it('should have default configuration allowSkipping as true', () => {
      const instantiatedTool = new StackScrollMouseWheelTool();

      expect(instantiatedTool.configuration.allowSkipping).toEqual(true);
    });
  });

  describe('mouseWheelCallback', () => {
    it('should call scroll function', () => {
      const instantiatedTool = new StackScrollMouseWheelTool();

      scroll.mockClear();

      instantiatedTool.mouseWheelCallback(mockEvent);
      expect(scroll).toHaveBeenCalled();
      expect(scroll).toHaveBeenCalledWith({}, 1, false, true);
    });
  });
});
