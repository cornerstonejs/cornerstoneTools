import AngleTool from './AngleTool.js';
import { getToolState } from './../../stateManagement/toolState.js';

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

describe('AngleTool.js', () => {
  describe('default values', () => {
    it('has a default name of "Angle"', () => {
      const defaultName = 'Angle';
      const instantiatedTool = new AngleTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('can be created with a custom tool name', () => {
      const customToolName = { name: 'customToolName' };
      const instantiatedTool = new AngleTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName.name);
    });
  });

  describe('createNewMeasurement', () => {
    it('returns an angle tool object', () => {
      const instantiatedTool = new AngleTool('Angle');

      const toolMeasurement = instantiatedTool.createNewMeasurement(
        goodMouseEventData
      );

      expect(typeof toolMeasurement).toBe(typeof {});
    });

    it("returns a measurement with a start, middle and end handle at the eventData's x and y", () => {
      const instantiatedTool = new AngleTool('toolName');

      const toolMeasurement = instantiatedTool.createNewMeasurement(
        goodMouseEventData
      );
      const startHandle = {
        x: toolMeasurement.handles.start.x,
        y: toolMeasurement.handles.start.y,
      };
      const middleHandle = {
        x: toolMeasurement.handles.middle.x,
        y: toolMeasurement.handles.middle.y,
      };
      const endHandle = {
        x: toolMeasurement.handles.end.x,
        y: toolMeasurement.handles.end.y,
      };

      expect(startHandle.x).toBe(goodMouseEventData.currentPoints.image.x);
      expect(startHandle.y).toBe(goodMouseEventData.currentPoints.image.y);
      expect(middleHandle.x).toBe(goodMouseEventData.currentPoints.image.x);
      expect(middleHandle.y).toBe(goodMouseEventData.currentPoints.image.y);
      expect(endHandle.x).toBe(goodMouseEventData.currentPoints.image.x);
      expect(endHandle.y).toBe(goodMouseEventData.currentPoints.image.y);
    });

    it('returns a measurement with a textBox handle', () => {
      const instantiatedTool = new AngleTool('toolName');

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
      const instantiatedTool = new AngleTool('AngleTool');
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
      const instantiatedTool = new AngleTool('AngleTool');

      const data = {
        handles: {
          start: {
            x: 166,
            y: 90,
          },
          middle: {
            x: 120,
            y: 113,
          },
          end: {
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
      const instantiatedTool = new AngleTool('AngleTool');
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
