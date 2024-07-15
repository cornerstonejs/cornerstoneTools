import AngleTool from './AngleTool.js';
import {
  addToolState,
  getToolState,
} from './../../stateManagement/toolState.js';
import { draw, drawLinkedTextBox } from './../../drawing/index.js';
import { moveNewHandle } from './../../manipulators/index.js';
import * as drawTextBoxModule from './../../drawing/drawTextBox.js';
import * as getPixelSpacing from '../../util/getPixelSpacing';

jest.mock('./../../stateManagement/toolState.js', () => ({
  addToolState: jest.fn(),
  getToolState: jest.fn(),
}));

jest.mock('./../../drawing/index.js', () => ({
  draw: jest.fn(),
  drawHandles: jest.fn(),
  drawJoinedLines: jest.fn(),
  drawLinkedTextBox: jest.fn(),
  getNewContext: jest.fn(() => ({})),
  setShadow: jest.fn(),
}));

jest.mock('./../../manipulators/index.js', () => ({
  moveNewHandle: jest.fn(),
}));

jest.mock('./../../importInternal.js', () => ({
  default: jest.fn(),
}));

jest.mock('./../../externalModules.js', () => ({
  cornerstone: {
    invalidate: jest.fn(),
    internal: {
      getTransform: jest.fn(() => ({
        invert: jest.fn(),
        transformPoint: jest.fn((x, y) => ({ x, y })),
      })),
    },
    metaData: {
      get: jest.fn(),
    },
    pixelToCanvas: () => ({ x: 100, y: 100 }),
    updateImage: jest.fn(),
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
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

    it('should not render linked text box if angle anchor is unset', () => {
      const instantiatedTool = new AngleTool('AngleTool');

      jest
        .spyOn(getPixelSpacing, 'default')
        .mockReturnValue({ rowPixelSpacing: 1, columnPixelSpacing: 1 });

      instantiatedTool.addNewMeasurement({
        detail: goodMouseEventData,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      });

      const addedMeasurementData = addToolState.mock.calls[0][2];

      addedMeasurementData.rAngle = 0;
      getToolState.mockReturnValueOnce({
        data: [addedMeasurementData],
      });

      const mockEvent = {
        currentTarget: {},
        detail: {
          enabledElement: undefined,
          canvasContext: { canvas: { width: 100, height: 100 } },
          element: {},
        },
      };

      instantiatedTool.renderToolData(mockEvent);

      const drawCallback = draw.mock.calls[0][1];

      drawCallback({});

      expect(drawLinkedTextBox).not.toHaveBeenCalled();
    });

    it('should render linked text box if angle anchor is set', () => {
      const instantiatedTool = new AngleTool('AngleTool');

      jest
        .spyOn(getPixelSpacing, 'default')
        .mockReturnValue({ rowPixelSpacing: 1, columnPixelSpacing: 1 });
      jest.spyOn(drawTextBoxModule, 'textBoxWidth').mockReturnValue(100);

      instantiatedTool.addNewMeasurement({
        detail: goodMouseEventData,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      });

      const moveNewHandleCallback = moveNewHandle.mock.calls[0][6];

      moveNewHandleCallback(true);

      const addedMeasurementData = addToolState.mock.calls[0][2];

      // Sets mock angle value
      addedMeasurementData.handles.start.x = 0;
      addedMeasurementData.handles.start.y = 50;
      addedMeasurementData.handles.middle.x = 0;
      addedMeasurementData.handles.middle.y = 0;
      addedMeasurementData.handles.end.x = 50;
      addedMeasurementData.handles.end.y = 20;

      getToolState.mockReturnValueOnce({
        data: [addedMeasurementData],
      });

      const mockEvent = {
        currentTarget: {},
        detail: {
          enabledElement: undefined,
          canvasContext: { canvas: { width: 100, height: 100 } },
          element: {},
        },
      };

      instantiatedTool.renderToolData(mockEvent);

      const drawCallback = draw.mock.calls[0][1];

      drawCallback({});

      expect(drawLinkedTextBox).toHaveBeenCalledTimes(1);
    });
  });
});
