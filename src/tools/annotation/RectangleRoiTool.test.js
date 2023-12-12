import RectangleRoiTool from './RectangleRoiTool.js';
import { getToolState } from './../../stateManagement/toolState.js';
import { getLogger } from '../../util/logger.js';
import Decimal from 'decimal.js';
import { formatArea } from '../../util/formatMeasurement.js';
import getNewContext from '../../drawing/getNewContext.js';
import drawRect from '../../drawing/drawRect.js';

/* ~ Setup
 * To mock properly, Jest needs jest.mock('moduleName') to be in the
 * same scope as the require/import statement.
 */
import external from '../../externalModules.js';

jest.mock('../../util/localization/localization.utils', () => ({
  __esModule: true,
  translate: jest.fn(val => val),
  localizeNumber: jest.fn(val => val),
}));

jest.mock('../../util/logger.js');
jest.mock('./../../stateManagement/toolState.js', () => ({
  getToolState: jest.fn(),
}));
jest.mock('../../drawing/drawRect', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('../../drawing/getNewContext', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('./../../externalModules.js', () => ({
  cornerstone: {
    pixelToCanvas: jest.fn(),
    metaData: {
      get: jest.fn(),
    },
    getViewport: jest.fn(),
    /* eslint-enable prettier/prettier */
    getPixels: () => [100, 100, 100, 100, 4, 5, 100, 3, 6],
    /* eslint-enable prettier/prettier */
    pixelToCanvas: jest.fn(),
  },
}));

jest.mock('../../drawing/getNewContext', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../../drawing/drawRect', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('../../drawing/drawHandles', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('../../drawing/drawLinkedTextBox', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../../util/formatMeasurement');

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

describe('RectangleRoiTool.js', () => {
  describe('default values', () => {
    it('has a default name of "RectangleRoi"', () => {
      const defaultName = 'RectangleRoi';
      const instantiatedTool = new RectangleRoiTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('can be created with a custom tool name', () => {
      const customToolName = { name: 'customToolName' };
      const instantiatedTool = new RectangleRoiTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName.name);
    });
  });

  describe('createNewMeasurement', () => {
    it('emits console error if required eventData is not provided', () => {
      const instantiatedTool = new RectangleRoiTool();
      const logger = getLogger();

      instantiatedTool.createNewMeasurement(badMouseEventData);

      expect(logger.error).toHaveBeenCalled();
      expect(logger.error.mock.calls[0][0]).toContain(
        'required eventData not supplied to tool'
      );
    });

    // Todo: create a more formal definition of a tool measurement object
    it('returns a tool measurement object', () => {
      const instantiatedTool = new RectangleRoiTool();

      const toolMeasurement = instantiatedTool.createNewMeasurement(
        goodMouseEventData
      );

      expect(typeof toolMeasurement).toBe(typeof {});
    });

    it("returns a measurement with a start and end handle at the eventData's x and y", () => {
      const instantiatedTool = new RectangleRoiTool();

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
      const instantiatedTool = new RectangleRoiTool();

      const toolMeasurement = instantiatedTool.createNewMeasurement(
        goodMouseEventData
      );

      const initialRotation = toolMeasurement.handles.initialRotation;

      expect(initialRotation).toBe(goodMouseEventData.viewport.rotation);
    });

    it('returns a measurement with a textBox handle', () => {
      const instantiatedTool = new RectangleRoiTool();

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
      const instantiatedTool = new RectangleRoiTool();
      const noHandlesMeasurementData = {
        handles: {},
      };
      const logger = getLogger();

      instantiatedTool.pointNearTool(element, noHandlesMeasurementData, coords);

      expect(logger.warn).toHaveBeenCalled();
      expect(logger.warn.mock.calls[0][0]).toContain('invalid parameters');
    });

    it('returns false when measurement data is null or undefined', () => {
      const instantiatedTool = new RectangleRoiTool();
      const nullMeasurementData = null;

      const isPointNearTool = instantiatedTool.pointNearTool(
        element,
        nullMeasurementData,
        coords
      );

      expect(isPointNearTool).toBe(false);
    });

    it('returns false when measurement data is not visible', () => {
      const instantiatedTool = new RectangleRoiTool();
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
      const instantiatedTool = new RectangleRoiTool();

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
      expect(data.cachedStats.area).toEqual(new Decimal(7));
      expect(data.cachedStats.areaUncertainty).toEqual(new Decimal(14));
      expect(data.cachedStats.mean).toEqual(57.6);
      expect(data.cachedStats.stdDev).toEqual(47.5);

      data.handles.start.x = 0;
      data.handles.start.y = 0;
      data.handles.end.x = 3;
      data.handles.end.y = 2;

      instantiatedTool.updateCachedStats(image, element, data);
      expect(data.cachedStats.area).toEqual(new Decimal(5));
      expect(data.cachedStats.mean).toEqual(68.2);
      expect(data.cachedStats.stdDev).toEqual(45);
    });

    it('should calculate the area and uncertainty based on updated pixelspacing values', () => {
      const instantiatedTool = new RectangleRoiTool();

      const data = {
        handles: {
          start: {
            x: 3,
            y: 3,
          },
          end: {
            x: 4,
            y: 4,
          },
        },
      };

      image.columnPixelSpacing = 0.1234;
      image.rowPixelSpacing = 1.123;

      instantiatedTool.updateCachedStats(image, element, data);
      expect(data.cachedStats.area).toEqual(new Decimal(0.1));
      expect(data.cachedStats.areaUncertainty).toEqual(new Decimal(2.8));
    });

    it('should return the average and standard deviation based on generic rounding', () => {
      const instantiatedTool = new RectangleRoiTool();

      const data = {
        handles: {
          start: {
            x: 1,
            y: 1,
          },
          end: {
            x: 4,
            y: 4,
          },
        },
      };

      instantiatedTool.updateCachedStats(image, element, data);
      expect(data.cachedStats.mean).toEqual(57.6);
      expect(data.cachedStats.stdDev).toEqual(47.5);
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
      const instantiatedTool = new RectangleRoiTool();
      const mockEvent = {
        detail: undefined,
        currentTarget: undefined,
      };

      getToolState.mockReturnValueOnce(undefined);

      const renderResult = instantiatedTool.renderToolData(mockEvent);

      expect(renderResult).toBe(undefined);
    });

    describe('should display uncertainties', () => {
      const toolState = {
        data: [
          {
            invalidated: true,
            visible: true,
            active: false,
            handles: {
              start: {
                x: 1,
                y: 1,
              },
              end: {
                x: 4,
                y: 4,
              },
              textBox: {}, // Not used
            },
          },
        ],
      };

      beforeAll(() => {
        getNewContext.mockReturnValue({
          save: jest.fn(),
          restore: jest.fn(),
        });
      });

      it.each([
        { displayUncertainties: false },
        { displayUncertainties: true },
      ])('should render the right text when %o', ({ displayUncertainties }) => {
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
        const instantiatedTool = new RectangleRoiTool({
          configuration: {
            displayUncertainties,
          },
        });

        getToolState.mockReturnValueOnce(toolState);

        instantiatedTool.renderToolData(mockEvent);

        expect(formatArea).toHaveBeenCalledWith(
          new Decimal(9),
          false,
          new Decimal(17),
          displayUncertainties
        );
      });
    });
  });

  describe('getToolTextFromToolState', () => {
    it('should return the formatted text', () => {
      // Arrange
      formatArea.mockReturnValue('A: 1 mm2');

      const context = {
        measureText: jest.fn().mockReturnValue({ width: 100 }),
      };
      const isColorImage = false;
      const toolState = {
        cachedStats: {
          area: 1,
          areaUncertainty: 2,
          mean: 3,
          stdDev: 4,
          min: 5,
          max: 6,
          meanStdDevSUV: undefined,
        },
      };
      const modality = 'CT';
      const hasPixelSpacing = true;
      const displayUncertainties = true;

      // Act
      const text = RectangleRoiTool.getToolTextFromToolState(
        context,
        isColorImage,
        toolState,
        modality,
        hasPixelSpacing,
        displayUncertainties
      );

      // Assert
      expect(text).toBe('A: 1 mm2\naverage: 3 HU\nstandardDeviation: 4 HU');
    });
  });
});
