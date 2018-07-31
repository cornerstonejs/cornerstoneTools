import RotateTool from './rotateTool.js';
import { getToolState } from './../stateManagement/toolState.js';

jest.mock('./../manipulators/drawHandles.js');
jest.mock('./../util/drawing.js');
jest.mock('./../stateManagement/toolState.js', () => ({
  getToolState: jest.fn()
}));

const badMouseEventData = 'hello world';
const goodMouseEventData = {
  currentPoints: {
    image: {
      x: 0,
      y: 0
    }
  }
};

describe('rotateTool.js', () => {
  beforeEach(() => {
    console.error = jest.fn();
    console.error.mockClear();
    console.warn = jest.fn();
    console.warn.mockClear();
  });

  describe('default values', () => {
    it('has a default name of "rotate"', () => {
      const defaultName = 'rotate';
      const instantiatedTool = new RotateTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('can be created with a custom tool name', () => {
      const customToolName = 'customToolName';
      const instantiatedTool = new RotateTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName);
    });
  });
});
