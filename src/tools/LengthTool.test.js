import LengthTool from './LengthTool.js';
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

describe('LengthTool.js', () => {
  beforeEach(() => {
    console.error = jest.fn();
    console.error.mockClear();
    console.warn = jest.fn();
    console.warn.mockClear();
  });

  describe('default values', () => {
    it('has a default name of "Length"', () => {
      const defaultName = 'Length';
      const instantiatedTool = new LengthTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('can be created with a custom tool name', () => {
      const customToolName = 'customToolName';
      const instantiatedTool = new LengthTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName);
    });
  });

  describe('createNewMeasurement', () => {
    it('emits console error if required eventData is not provided', () => {
      const instantiatedTool = new LengthTool('toolName');

      instantiatedTool.createNewMeasurement(badMouseEventData);

      expect(console.error).toHaveBeenCalled();
      expect(console.error.mock.calls[0][0]).toContain(
        'required eventData not supplied to tool'
      );
    });

    // Todo: create a more formal definition of a tool measurement object
    it('returns a tool measurement object', () => {
      const instantiatedTool = new LengthTool('toolName');

      const toolMeasurement = instantiatedTool.createNewMeasurement(
        goodMouseEventData
      );

      expect(typeof toolMeasurement).toBe(typeof {});
    });

    it('returns a measurement with a start and end handle at the eventData\'s x and y', () => {
      const instantiatedTool = new LengthTool('toolName');

      const toolMeasurement = instantiatedTool.createNewMeasurement(
        goodMouseEventData
      );
      const startHandle = {
        x: toolMeasurement.handles.start.x,
        y: toolMeasurement.handles.start.y
      };
      const endHandle = {
        x: toolMeasurement.handles.end.x,
        y: toolMeasurement.handles.end.y
      };

      expect(startHandle.x).toBe(goodMouseEventData.currentPoints.image.x);
      expect(startHandle.y).toBe(goodMouseEventData.currentPoints.image.y);
      expect(endHandle.x).toBe(goodMouseEventData.currentPoints.image.x);
      expect(endHandle.y).toBe(goodMouseEventData.currentPoints.image.y);
    });

    it('returns a measurement with a textBox handle', () => {
      const instantiatedTool = new LengthTool('toolName');

      const toolMeasurement = instantiatedTool.createNewMeasurement(
        goodMouseEventData
      );

      expect(typeof toolMeasurement.handles.textBox).toBe(typeof {});
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
      const instantiatedTool = new LengthTool('toolName');
      const noHandlesMeasurementData = {
        handles: {}
      };

      instantiatedTool.pointNearTool(element, noHandlesMeasurementData, coords);

      expect(console.warn).toHaveBeenCalled();
      expect(console.warn.mock.calls[0][0]).toContain('invalid parameters');
    });

    it('returns false when measurement data is null or undefined', () => {
      const instantiatedTool = new LengthTool('toolName');
      const nullMeasurementData = null;

      const isPointNearTool = instantiatedTool.pointNearTool(
        element,
        nullMeasurementData,
        coords
      );

      expect(isPointNearTool).toBe(false);
    });

    it('returns false when measurement data is not visible', () => {
      const instantiatedTool = new LengthTool('toolName');
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
      const instantiatedTool = new LengthTool('toolName');
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
