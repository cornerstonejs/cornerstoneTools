import Tool from './CobbAngleTool.js';
import { getToolState } from '../../stateManagement/toolState.js';

jest.mock('./../../stateManagement/toolState.js', () => ({
  getToolState: jest.fn(),
}));

jest.mock('./../../importInternal.js', () => ({
  default: jest.fn(),
}));

jest.mock('./../../externalModules.js', () => ({
  cornerstone: {
    metaData: {
      get: jest.fn(),
    },
  },
}));

const goodMouseEventData = {
  currentPoints: {
    image: {
      x: 0,
      y: 0,
    },
  },
};

const image = {
  rowPixelSpacing: 0.8984375,
  columnPixelSpacing: 0.8984375,
};

describe('CobbAngleTool.js', () => {
  describe('default values', () => {
    it('has a default name of "CobbAngle"', () => {
      const defaultName = 'CobbAngle';
      const instantiatedTool = new Tool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('can be created with a custom tool name', () => {
      const customToolName = { name: 'customToolName' };
      const instantiatedTool = new Tool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName.name);
    });
  });

  describe('createNewMeasurement', () => {
    it('returns aa new measurement object', () => {
      const instantiatedTool = new Tool('CobbAngle');

      const toolMeasurement = instantiatedTool.createNewMeasurement(
        goodMouseEventData
      );

      expect(typeof toolMeasurement).toBe(typeof {});
    });

    it("returns a measurement with a start, end, start2 and end2 handles at the eventData's x and y", () => {
      const instantiatedTool = new Tool('toolName');

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
      const start2Handle = {
        x: toolMeasurement.handles.start2.x,
        y: toolMeasurement.handles.start2.y,
      };
      const end2Handle = {
        x: toolMeasurement.handles.end2.x,
        y: toolMeasurement.handles.end2.y,
      };

      expect(startHandle.x).toBe(goodMouseEventData.currentPoints.image.x);
      expect(startHandle.y).toBe(goodMouseEventData.currentPoints.image.y);
      expect(start2Handle.x).toBe(goodMouseEventData.currentPoints.image.x);
      expect(start2Handle.y).toBe(goodMouseEventData.currentPoints.image.y);
      expect(endHandle.x).toBe(goodMouseEventData.currentPoints.image.x);
      expect(endHandle.y).toBe(goodMouseEventData.currentPoints.image.y);
      expect(end2Handle.x).toBe(goodMouseEventData.currentPoints.image.x + 1);
      expect(end2Handle.y).toBe(goodMouseEventData.currentPoints.image.y);
    });

    it('returns a measurement with a textBox handle', () => {
      const instantiatedTool = new Tool('toolName');

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

    it('returns false when measurement data is not visible', () => {
      const instantiatedTool = new Tool('AngleTool');
      const notVisibleMeasurementData = {
        visible: false,
      };

      const isPointNearTool = instantiatedTool.pointNearTool(
        element,
        notVisibleMeasurementData,
        coords
      );

      expect(isPointNearTool).toBe(false);
    });
  });

  describe('updateCachedStats', () => {
    let element;

    beforeEach(() => {
      element = jest.fn();
    });

    it('should calculate and update annotation value', () => {
      const instantiatedTool = new Tool('AngleTool');

      const data = {
        handles: {
          start: {
            x: 166,
            y: 90,
          },
          end: {
            x: 120,
            y: 113,
          },
          start2: {
            x: 120,
            y: 113,
          },
          end2: {
            x: 145,
            y: 143,
          },
        },
      };

      instantiatedTool.updateCachedStats(image, element, data);
      expect(data.rAngle).toBe(76.76);
      expect(data.invalidated).toBe(false);
    });
  });

  describe('renderToolData', () => {
    it('returns undefined when no toolData exists for the tool', () => {
      const instantiatedTool = new Tool('AngleTool');
      const mockEvent = {
        detail: {
          enabledElement: undefined,
        },
      };

      getToolState.mockReturnValueOnce(undefined);

      const renderResult = instantiatedTool.renderToolData(mockEvent);

      expect(renderResult).toBe(undefined);
    });
  });
});
