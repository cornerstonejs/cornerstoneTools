/* eslint no-underscore-dangle: 0 */
import StackScrollMultiTouchTool from './StackScrollMultiTouchTool.js';
import scroll from '../util/scroll.js';

jest.mock('../util/scroll.js');

const mockEvent = {
  detail: {
    direction: 1,
    element: {},
    numPointers: 3,
    deltaPoints: {
      page: {
        y: 5,
      },
    },
  },
};

describe('stackScrollMultiTouchTool.js', () => {
  describe('default values', () => {
    it('has a default name of "StackScrollMultiTouch"', () => {
      const defaultName = 'StackScrollMultiTouch';
      const instantiatedTool = new StackScrollMultiTouchTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('can be created with a custom tool name', () => {
      const customToolName = { name: 'customToolName' };
      const instantiatedTool = new StackScrollMultiTouchTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName.name);
    });

    it('should have default configuration loop as false', () => {
      const instantiatedTool = new StackScrollMultiTouchTool();

      expect(instantiatedTool.configuration.loop).toEqual(false);
    });

    it('should have default configuration allowSkipping as true', () => {
      const instantiatedTool = new StackScrollMultiTouchTool();

      expect(instantiatedTool.configuration.allowSkipping).toEqual(true);
    });
  });

  describe('_dragCallback', () => {
    let instantiatedTool;

    beforeEach(() => {
      instantiatedTool = new StackScrollMultiTouchTool();

      instantiatedTool._getDeltaY = jest.fn();
      instantiatedTool._getPixelPerImage = jest.fn();

      scroll.mockClear();
    });

    it('should change image in case drag variation on Y is bigger than image pixels devided by images', () => {
      instantiatedTool._getDeltaY.mockReturnValue(600);
      instantiatedTool._getPixelPerImage.mockReturnValue(100);

      instantiatedTool._dragCallback(mockEvent);

      expect(scroll).toHaveBeenCalled();
    });

    it('should NOT change image in case drag variation on Y is smaller than image pixels devided by images', () => {
      instantiatedTool._getDeltaY.mockReturnValue(100);
      instantiatedTool._getPixelPerImage.mockReturnValue(600);

      instantiatedTool._dragCallback(mockEvent);

      expect(scroll).not.toHaveBeenCalled();
    });
  });
});
