import LengthTool from './LengthTool.js';
import { getToolState } from './../../stateManagement/toolState.js';
import { getLogger } from '../../util/logger.js';
import Decimal from 'decimal.js';
import getPixelSpacing from '../../util/pixelSpacing/getPixelSpacing.js';
import { formatLenght } from '../../util/formatMeasurement.js';

jest.mock('../../util/logger.js');
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
jest.mock('./../../drawing/index.js', () => ({
  getNewContext: jest.fn(),
  draw: (c, f) => f(c),
  drawLine: jest.fn(),
  setShadow: jest.fn(),
}));

jest.mock('./../../drawing/drawLinkedTextBox.js');
jest.mock('../../util/pixelSpacing/getPixelSpacing.js');
jest.mock('./../../drawing/drawHandles.js');
jest.mock('../../util/formatMeasurement');

const badMouseEventData = 'hello world';
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

describe('LengthTool.js', () => {
  describe('default values', () => {
    it('has a default name of "Length"', () => {
      const defaultName = 'Length';
      const instantiatedTool = new LengthTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('can be created with a custom tool name', () => {
      const customToolName = { name: 'customToolName' };
      const instantiatedTool = new LengthTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName.name);
    });
  });

  describe('createNewMeasurement', () => {
    it('emits console error if required eventData is not provided', () => {
      const instantiatedTool = new LengthTool('toolName');
      const logger = getLogger();

      instantiatedTool.createNewMeasurement(badMouseEventData);

      expect(logger.error).toHaveBeenCalled();
      expect(logger.error.mock.calls[0][0]).toContain(
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

    it("returns a measurement with a start and end handle at the eventData's x and y", () => {
      const instantiatedTool = new LengthTool('toolName');

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
        handles: {},
      };
      const logger = getLogger();

      instantiatedTool.pointNearTool(element, noHandlesMeasurementData, coords);

      expect(logger.warn).toHaveBeenCalled();
      expect(logger.warn.mock.calls[0][0]).toContain('invalid parameters');
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
      const instantiatedTool = new LengthTool('toolName');

      const data = {
        handles: {
          start: {
            x: 166.10687022900754,
            y: 90.8702290076336,
          },
          end: {
            x: 145.58778625954199,
            y: 143.63358778625957,
          },
        },
      };

      getPixelSpacing.mockReturnValue({
        colPixelSpacing: image.columnPixelSpacing,
        rowPixelSpacing: image.rowPixelSpacing,
      });

      instantiatedTool.updateCachedStats(image, element, data);
      expect(data.length).toEqual(new Decimal(50.9));
      expect(data.uncertainty).toEqual(new Decimal(1.3));

      data.handles.start.x = 138.74809160305347;
      data.handles.start.y = 71.32824427480917;
      data.handles.end.x = 79.14503816793899;
      data.handles.end.y = 121.16030534351145;

      instantiatedTool.updateCachedStats(image, element, data);
      expect(data.length).toEqual(new Decimal(69.8));
      expect(data.uncertainty).toEqual(new Decimal(1.3));
    });

    it('should calculate and update length and uncertainty value when pixelSpacing value is falsy', () => {
      const instantiatedTool = new LengthTool('toolName');

      const data = {
        handles: {
          start: {
            x: 166.10687022900754,
            y: 90.8702290076336,
          },
          end: {
            x: 145.58778625954199,
            y: 143.63358778625957,
          },
        },
      };

      getPixelSpacing.mockReturnValue({
        colPixelSpacing: null,
        rowPixelSpacing: null,
      });

      instantiatedTool.updateCachedStats(image, element, data);

      expect(data.length).toEqual(new Decimal(56.6));
      expect(data.uncertainty).toEqual(new Decimal(1.4));
    });
  });

  describe('renderToolData', () => {
    it('returns undefined when no toolData exists for the tool', () => {
      const instantiatedTool = new LengthTool('toolName');
      const mockEvent = {
        detail: undefined,
        currentTarget: undefined,
      };

      getToolState.mockReturnValueOnce(undefined);

      const renderResult = instantiatedTool.renderToolData(mockEvent);

      expect(renderResult).toBe(undefined);
    });

    describe('should display uncertainties', () => {
      it.each([
        { displayUncertainties: false },
        { displayUncertainties: true },
      ])('should render the right text when %o', ({ displayUncertainties }) => {
        const instantiatedTool = new LengthTool({
          configuration: { displayUncertainties },
        });

        getPixelSpacing.mockReturnValue({
          rowPixelSpacing: 0,
          colPixelSpacing: 0,
          unit: 'mm',
        });

        const mockEvent = {
          detail: { canvasContext: { canvas: {} } },
          currentTarget: undefined,
        };

        const length = 17.3;
        const uncertainty = 0.4;

        getToolState.mockReturnValueOnce({
          data: [
            {
              visible: true,
              handles: {
                textBox: { hasMoved: true },
              },
              length,
              uncertainty,
            },
          ],
        });

        instantiatedTool.renderToolData(mockEvent);

        expect(formatLenght).toHaveBeenCalledWith(
          length,
          'mm',
          uncertainty,
          displayUncertainties
        );
      });
    });
  });

  describe('getToolTextFromToolState', () => {
    it('should return the formatted text', () => {
      // Arrange
      formatLenght.mockReturnValue('10 mm');

      const context = {};
      const isColorImage = false;
      const toolState = {
        length: 10,
      };
      const modality = 'CT';
      const hasPixelSpacing = true;
      const displayUncertainties = true;

      // Act
      const text = LengthTool.getToolTextFromToolState(
        context,
        isColorImage,
        toolState,
        modality,
        hasPixelSpacing,
        displayUncertainties
      );

      // Assert
      expect(text).toBe('10 mm');
    });
  });
});
