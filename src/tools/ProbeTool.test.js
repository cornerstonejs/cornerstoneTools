import ProbeTool from './ProbeTool.js';
import { getToolState } from './../stateManagement/toolState.js';

jest.mock('./../stateManagement/toolState.js', () => ({
  getToolState: jest.fn()
}));

jest.mock('../import.js', () => ({
  default: jest.fn()
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

describe('ProbeTool.js', () => {
  beforeEach(() => {
    console.error = jest.fn();
    console.error.mockClear();
    console.warn = jest.fn();
    console.warn.mockClear();
  });

  describe('default values', () => {
    it('has a default name of "Probe"', () => {
      const defaultName = 'Probe';
      const instantiatedTool = new ProbeTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('can be created with a custom tool name', () => {
      const customToolName = 'customToolName';
      const instantiatedTool = new ProbeTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName);
    });
  });

  describe('createNewMeasurement', () => {
    it('emits console error if required eventData is not provided', () => {
      const instantiatedTool = new ProbeTool();

      instantiatedTool.createNewMeasurement(badMouseEventData);

      expect(console.error).toHaveBeenCalled();
      expect(console.error.mock.calls[0][0]).toContain(
        'required eventData not supplieed to tool'
      );
    });

    // Todo: create a more formal definition of a tool measurement object
    it('returns a tool measurement object', () => {
      const instantiatedTool = new ProbeTool();

      const toolMeasurement = instantiatedTool.createNewMeasurement(
        goodMouseEventData
      );

      expect(typeof toolMeasurement).toBe(typeof {});
    });

    it('returns a measurement with an end handle at the eventData\'s x and y and an undefined start', () => {
      const instantiatedTool = new ProbeTool();

      const toolMeasurement = instantiatedTool.createNewMeasurement(
        goodMouseEventData
      );
      const endHandle = {
        x: toolMeasurement.handles.end.x,
        y: toolMeasurement.handles.end.y
      };

      expect(toolMeasurement.handles.start).toBeUndefined();
      expect(endHandle.x).toBe(goodMouseEventData.currentPoints.image.x);
      expect(endHandle.y).toBe(goodMouseEventData.currentPoints.image.y);
    });
  });

  describe('pointNearTool', () => {
    let element, coords;

    beforeEach(() => {
      element = jest.fn();
      coords = jest.fn();
    });

    // Todo: Not sure we want all of our methods to check for valid params.
    it('emits a console warning when measurementData without start/end handles are supplied', () => {
      const instantiatedTool = new ProbeTool();
      const noHandlesMeasurementData = {
        handles: {}
      };

      instantiatedTool.pointNearTool(element, noHandlesMeasurementData, coords);

      expect(console.warn).toHaveBeenCalled();
      expect(console.warn.mock.calls[0][0]).toContain('invalid parameters');
    });

    it('returns false when measurement data is null or undefined', () => {
      const instantiatedTool = new ProbeTool();
      const nullMeasurementData = null;

      const isPointNearTool = instantiatedTool.pointNearTool(
        element,
        nullMeasurementData,
        coords
      );

      expect(isPointNearTool).toBe(false);
    });

    it('returns false when measurement data is not visible', () => {
      const instantiatedTool = new ProbeTool();
      const notVisibleMeasurementData = {
        visible: false
      };

      const isPointNearTool = instantiatedTool.pointNearTool(
        element,
        notVisibleMeasurementData,
        coords
      );

      expect(isPointNearTool).toBe(false);
    });
  });

  describe('renderToolData', () => {
    it('returns undefined when no toolData exists for the tool', () => {
      const instantiatedTool = new ProbeTool();
      const mockEvent = {
        detail: undefined,
        currentTarget: undefined
      };

      getToolState.mockReturnValueOnce(undefined);

      const renderResult = instantiatedTool.renderToolData(mockEvent);

      expect(renderResult).toBe(undefined);
    });
  });
});
