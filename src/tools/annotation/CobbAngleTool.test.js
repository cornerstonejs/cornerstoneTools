import Tool from './CobbAngleTool.js';
import { getToolState } from '../../stateManagement/toolState.js';
import external from '../../externalModules.js';
import { localizeNumber } from '../../util/localization/localization.utils.js';

jest.mock('./../../stateManagement/toolState.js', () => ({
  getToolState: jest.fn(),
}));

jest.mock('./../../externalModules.js');

jest.mock('../../util/localization/localization.utils', () => ({
  __esModule: true,
  translate: jest.fn(val => val),
  localizeNumber: jest.fn(val => val),
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
  beforeEach(() => {
    jest.resetAllMocks();
  });

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

    it('returns false when measurement data is incomplete', () => {
      const instantiatedTool = new Tool('AngleTool');

      instantiatedTool.hasIncomplete = true;
      const measurementData = {
        visible: true,
        handles: {
          start: { x: 10, y: 10 },
          end: { x: 20, y: 10 },
        },
      };
      const isPointNearTool = instantiatedTool.pointNearTool(
        element,
        measurementData,
        measurementData.handles.start
      );

      expect(isPointNearTool).toBe(false);
    });

    it('returns true when measurement data is near the end points', () => {
      const instantiatedTool = new Tool('AngleTool');
      const measurementData = {
        visible: true,
        handles: {
          start: { x: 10, y: 10 },
          end: { x: 20, y: 10 },
          start2: { x: 40, y: 10 },
          end2: { x: 40, y: 40 },
        },
      };

      external.cornerstone.pixelToCanvas.mockImplementation((el, pt) => pt);

      expect(
        instantiatedTool.pointNearTool(element, measurementData, {
          x: 70,
          y: 10,
        })
      ).toBe(false);

      expect(
        instantiatedTool.pointNearTool(
          element,
          measurementData,
          measurementData.handles.start
        )
      ).toBe(true);

      expect(
        instantiatedTool.pointNearTool(
          element,
          measurementData,
          measurementData.handles.end2
        )
      ).toBe(true);
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
      expect(data.alphaAngle).toBe(76.8);
      expect(data.betaAngle).toBe(103.2);
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

  describe('getToolTextFromToolState', () => {
    it('should return the formatted text', () => {
      // Arrange
      localizeNumber.mockReturnValueOnce('10');
      localizeNumber.mockReturnValueOnce('60');
      const context = {};
      const isColorImage = false;
      const toolState = {
        alphaAngle: 10,
        betaAngle: 60,
      };
      const modality = 'CT';
      const hasPixelSpacing = true;
      const displayUncertainties = true;

      // Act
      const text = Tool.getToolTextFromToolState(
        context,
        isColorImage,
        toolState,
        modality,
        hasPixelSpacing,
        displayUncertainties
      );

      // Assert
      expect(text).toBe('10°, 60°');
    });
  });
});
