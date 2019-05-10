import CircleRoiTool from './CircleRoiTool.js';
import { getToolState } from './../../stateManagement/toolState.js';
import { getLogger } from '../../util/logger.js';

/* ~ Setup
 * In order to mock properly, Jest needs jest.mock('moduleName') to be in the
 * same scope as the require/import statement.
 */
import external from '../../externalModules.js';

jest.mock('../../util/logger.js');
jest.mock('./../../stateManagement/toolState.js', () => ({
  getToolState: jest.fn(),
}));

jest.mock('./../../import.js', () => ({
  default: jest.fn(),
}));

jest.mock('../../externalModules.js');

const badMouseEventData = 'hello world';
const goodMouseEventData = {
  currentPoints: {
    image: {
      x: 0,
      y: 0,
    },
  },
  viewport: {
    rotation: 0,
  },
};

describe('CircleRoiTool.js', () => {
  describe('default values', () => {
    it('has a default name of "CircleRoi"', () => {
      const defaultName = 'CircleRoi';
      const instantiatedTool = new CircleRoiTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('can be created with a custom tool name', () => {
      const customToolName = { name: 'customToolName' };
      const instantiatedTool = new CircleRoiTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName.name);
    });
  });

  describe('createNewMeasurement', () => {
    it('emits console error if required eventData is not provided', () => {
      const instantiatedTool = new CircleRoiTool();
      const logger = getLogger();

      instantiatedTool.createNewMeasurement(badMouseEventData);

      expect(logger.error).toHaveBeenCalled();
      expect(logger.error.mock.calls[0][0]).toContain(
        'required eventData not supplied to tool'
      );
    });

    // Todo: create a more formal definition of a tool measurement object
    it('returns a tool measurement object', () => {
      const instantiatedTool = new CircleRoiTool();

      const toolMeasurement = instantiatedTool.createNewMeasurement(
        goodMouseEventData
      );

      expect(typeof toolMeasurement).toBe(typeof {});
    });

    it("returns a measurement with a start and end handle at the eventData's x and y", () => {
      const instantiatedTool = new CircleRoiTool();

      const toolMeasurement = instantiatedTool.createNewMeasurement(
        goodMouseEventData
      );
      const startHandle = {
        x: toolMeasurement.handles.start.x,
        y: toolMeasurement.handles.start.y,
      };
      const endHandle = {
        x: toolMeasurement.handles.end.x,
        y: toolMeasurement.handles.end.y,
      };

      expect(startHandle.x).toBe(goodMouseEventData.currentPoints.image.x);
      expect(startHandle.y).toBe(goodMouseEventData.currentPoints.image.y);
      expect(endHandle.x).toBe(goodMouseEventData.currentPoints.image.x);
      expect(endHandle.y).toBe(goodMouseEventData.currentPoints.image.y);
    });

    it('returns a measurement with a initial rotation', () => {
      const instantiatedTool = new CircleRoiTool();

      const toolMeasurement = instantiatedTool.createNewMeasurement(
        goodMouseEventData
      );

      const initialRotation = toolMeasurement.handles.initialRotation;

      expect(initialRotation).toBe(goodMouseEventData.viewport.rotation);
    });

    it('returns a measurement with a textBox handle', () => {
      const instantiatedTool = new CircleRoiTool();

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
      const instantiatedTool = new CircleRoiTool();
      const noHandlesMeasurementData = {
        handles: {},
      };
      const logger = getLogger();

      instantiatedTool.pointNearTool(element, noHandlesMeasurementData, coords);

      expect(logger.warn).toHaveBeenCalled();
      expect(logger.warn.mock.calls[0][0]).toContain('invalid parameters');
    });

    it('returns false when measurement data is null or undefined', () => {
      const instantiatedTool = new CircleRoiTool();
      const nullMeasurementData = null;

      const isPointNearTool = instantiatedTool.pointNearTool(
        element,
        nullMeasurementData,
        coords
      );

      expect(isPointNearTool).toBe(false);
    });

    it('returns false when measurement data is not visible', () => {
      const instantiatedTool = new CircleRoiTool();
      const nullMeasurementData = null;

      const isPointNearTool = instantiatedTool.pointNearTool(
        element,
        nullMeasurementData,
        coords
      );

      expect(isPointNearTool).toBe(false);
    });

    it('returns false when point is inside the cirle roi', () => {
      const instantiatedTool = new CircleRoiTool();
      const toolMeasurement = instantiatedTool.createNewMeasurement(
        goodMouseEventData
      );

      // Setting the coordinates to be inside the circle annotation
      const coords = {
        x: 20,
        y: 20,
      };

      // picking a start handler as {x: 25, y: 25} and end handler as {x: 15, y: 15};
      external.cornerstone.pixelToCanvas
        .mockReturnValueOnce({
          x: 25,
          y: 25,
        })
        .mockReturnValueOnce({
          x: 15,
          y: 15,
        });

      const isPointNearTool = instantiatedTool.pointNearTool(
        element,
        toolMeasurement,
        coords,
        'mouse'
      );

      expect(isPointNearTool).toBe(false);
    });

    it('returns true when point is within hit area region', () => {
      const instantiatedTool = new CircleRoiTool();
      const toolMeasurement = instantiatedTool.createNewMeasurement(
        goodMouseEventData
      );

      // Setting the coordinates outside the cirlce boundary but between the half of hit area region(15)
      const coords = {
        x: 15,
        y: 30,
      };

      external.cornerstone.pixelToCanvas
        .mockReturnValueOnce({
          x: 15,
          y: 20,
        })
        .mockReturnValueOnce({
          x: 15,
          y: 25,
        });
      const isPointNearTool = instantiatedTool.pointNearTool(
        element,
        toolMeasurement,
        coords,
        'mouse'
      );

      expect(isPointNearTool).toBe(true);
    });
  });

  describe('renderToolData', () => {
    it('returns undefined when no toolData exists for the tool', () => {
      const instantiatedTool = new CircleRoiTool();
      const mockEvent = {
        detail: undefined,
        currentTarget: undefined,
      };

      getToolState.mockReturnValueOnce(undefined);

      const renderResult = instantiatedTool.renderToolData(mockEvent);

      expect(renderResult).toBe(undefined);
    });
  });
});
