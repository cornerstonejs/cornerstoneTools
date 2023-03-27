import EllipticalRoiTool from './EllipticalRoiTool.js';
import { getToolState } from './../../stateManagement/toolState.js';
import { getLogger } from '../../util/logger.js';
import getNewContext from '../../drawing/getNewContext.js';
import drawEllipse from '../../drawing/drawEllipse.js';

/* ~ Setup
 * To mock properly, Jest needs jest.mock('moduleName') to be in the
 * same scope as the require/import statement.
 */
import external from '../../externalModules.js';

jest.mock('../../util/logger.js');
jest.mock('./../../stateManagement/toolState.js', () => ({
  getToolState: jest.fn(),
}));
jest.mock('../../drawing/drawEllipse', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('../../drawing/getNewContext', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('./../../importInternal.js', () => ({
  default: jest.fn(),
}));

jest.mock('./../../externalModules.js', () => ({
  cornerstone: {
    metaData: {
      get: jest.fn(),
    },
    /* eslint-disable prettier/prettier */
    getPixels: () => [100, 100, 100, 100, 4, 5, 100, 3, 6],
    /* eslint-enable prettier/prettier */
    pixelToCanvas: jest.fn(),
  },
}));

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

const image = {
  rowPixelSpacing: 0.8984375,
  columnPixelSpacing: 0.8984375,
};

describe('EllipticalRoiTool.js', () => {
  describe('default values', () => {
    it('has a default name of "EllipticalRoi"', () => {
      const defaultName = 'EllipticalRoi';
      const instantiatedTool = new EllipticalRoiTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('can be created with a custom tool name', () => {
      const customToolName = { name: 'customToolName' };
      const instantiatedTool = new EllipticalRoiTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName.name);
    });
  });

  describe('createNewMeasurement', () => {
    it('emits console error if required eventData is not provided', () => {
      const instantiatedTool = new EllipticalRoiTool();
      const logger = getLogger();

      instantiatedTool.createNewMeasurement(badMouseEventData);

      expect(logger.error).toHaveBeenCalled();
      expect(logger.error.mock.calls[0][0]).toContain(
        'required eventData not supplied to tool'
      );
    });

    // Todo: create a more formal definition of a tool measurement object
    it('returns a tool measurement object', () => {
      const instantiatedTool = new EllipticalRoiTool();

      const toolMeasurement = instantiatedTool.createNewMeasurement(
        goodMouseEventData
      );

      expect(typeof toolMeasurement).toBe(typeof {});
    });

    it("returns a measurement with a start and end handle at the eventData's x and y", () => {
      const instantiatedTool = new EllipticalRoiTool();

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
      const instantiatedTool = new EllipticalRoiTool();

      const toolMeasurement = instantiatedTool.createNewMeasurement(
        goodMouseEventData
      );

      const initialRotation = toolMeasurement.handles.initialRotation;

      expect(initialRotation).toBe(goodMouseEventData.viewport.rotation);
    });

    it('returns a measurement with a textBox handle', () => {
      const instantiatedTool = new EllipticalRoiTool();

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
      const instantiatedTool = new EllipticalRoiTool();
      const noHandlesMeasurementData = {};
      const logger = getLogger();

      instantiatedTool.pointNearTool(element, noHandlesMeasurementData, coords);

      expect(logger.warn).toHaveBeenCalled();
      expect(logger.warn.mock.calls[0][0]).toContain('invalid parameters');
    });

    it('returns false when measurement data is null or undefined', () => {
      const instantiatedTool = new EllipticalRoiTool();
      const nullMeasurementData = null;

      const isPointNearTool = instantiatedTool.pointNearTool(
        element,
        nullMeasurementData,
        coords
      );

      expect(isPointNearTool).toBe(false);
    });

    it('returns false when measurement data is not visible', () => {
      const instantiatedTool = new EllipticalRoiTool();
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

    it('should calculate and update annotation values', () => {
      const instantiatedTool = new EllipticalRoiTool();

      const data = {
        handles: {
          start: {
            x: 0,
            y: 0,
          },
          end: {
            x: 3,
            y: 3,
          },
        },
      };

      instantiatedTool.updateCachedStats(image, element, data);
      expect(data.cachedStats.area.toFixed(2)).toEqual('5.71');
      expect(data.cachedStats.mean.toFixed(2)).toEqual('4.50');
      expect(data.cachedStats.stdDev.toFixed(2)).toEqual('1.12');

      data.handles.start.x = 0;
      data.handles.start.y = 0;
      data.handles.end.x = 3;
      data.handles.end.y = 2;

      instantiatedTool.updateCachedStats(image, element, data);
      expect(data.cachedStats.area.toFixed(2)).toEqual('3.80');
      expect(data.cachedStats.mean.toFixed(2)).toEqual('36.33');
      expect(data.cachedStats.stdDev.toFixed(2)).toEqual('45.02');
    });
  });

  describe('renderToolData', () => {
    beforeAll(() => {
      getNewContext.mockReturnValue({
        save: jest.fn(),
        restore: jest.fn(),
        beginPath: jest.fn(),
        arc: jest.fn(),
        stroke: jest.fn(),
        fillRect: jest.fn(),
        fillText: jest.fn(),
        measureText: jest.fn(() => ({ width: 1 })),
      });
      external.cornerstone.pixelToCanvas.mockImplementation((comp, val) => val);
    });

    it('returns undefined when no toolData exists for the tool', () => {
      const instantiatedTool = new EllipticalRoiTool();
      const mockEvent = {
        detail: undefined,
        currentTarget: undefined,
      };

      getToolState.mockReturnValueOnce(undefined);

      const renderResult = instantiatedTool.renderToolData(mockEvent);

      expect(renderResult).toBe(undefined);
    });

    describe('draw ellipse with color', () => {
      const defaulColor = 'white';
      const mockEvent = {
        detail: {
          element: {},
          canvasContext: {
            canvas: {},
          },
          image: {},
          viewport: {},
        },
      };
      const instantiatedTool = new EllipticalRoiTool({
        configuration: {},
      });

      const toolState = {
        data: [
          {
            visible: true,
            active: false,
            handles: {
              start: {
                x: 0,
                y: 0,
              },
              end: {
                x: 3,
                y: 3,
              },
              textBox: {},
            },
          },
        ],
      };

      const expectDraw = color => {
        expect(drawEllipse.mock.calls.length).toBe(1);
      };

      it('should draw an ellipse with the inactive color', () => {
        toolState.data[0].active = false;
        getToolState.mockReturnValue(toolState);

        instantiatedTool.renderToolData(mockEvent);

        expectDraw(defaulColor);
      });
    });
  });
});
