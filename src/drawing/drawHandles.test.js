// SUT
import drawHandles from './drawHandles.js';

/* ~ Setup
 * In order to mock properly, Jest needs jest.mock('moduleName') to be in the
 * same scope as the require/import statement.
 */
import getNewContext from './getNewContext.js';
import external from './../externalModules.js';
import { state } from './../store/index.js';

jest.mock('./../externalModules.js');

const { createCanvas } = require('canvas');

describe('drawing/drawHandles.js', () => {
  let canvas, context;

  beforeEach(() => {
    jest.resetAllMocks();
    canvas = createCanvas(200, 200);
    context = getNewContext(canvas);

    context.arc = jest.fn();
  });

  it('draws an arc for each handle', () => {
    // Setup
    const handles = [
      {
        x: 0,
        y: 0,
      },
      {
        x: 0,
        y: 0,
      },
      {
        x: 0,
        y: 0,
      },
    ];
    const numberOfHandles = 3;

    external.cornerstone.pixelToCanvas.mockReturnValue({
      x: 0,
      y: 0,
    });

    // Call
    drawHandles(context, {}, handles);

    // Assert
    // Expect(external.cornerstone.pixelToCanvas).toHaveBeenCalledTimes(1);
    expect(context.arc).toHaveBeenCalledTimes(numberOfHandles);
  });

  describe('handleRadius priority', () => {
    it('uses the default handle radius if one is not specified by the handle or tool', () => {
      // Setup
      const expectedHandleRadius = 10;
      const handles = [
        {
          x: 0,
          y: 0,
        },
      ];

      state.handleRadius = expectedHandleRadius;
      external.cornerstone.pixelToCanvas.mockReturnValue({
        x: 0,
        y: 0,
      });

      // Call
      drawHandles(context, {}, handles);

      // Assert
      expect(context.arc).toBeCalledWith(
        0,
        0,
        expectedHandleRadius,
        0,
        2 * Math.PI
      );
    });

    it('uses options.handleRadius if one is not specified on the handle', () => {
      // Setup
      const expectedHandleRadius = 10;
      const handles = [
        {
          x: 0,
          y: 0,
        },
      ];

      external.cornerstone.pixelToCanvas.mockReturnValue({
        x: 0,
        y: 0,
      });

      // Call
      drawHandles(context, {}, handles, { handleRadius: expectedHandleRadius });

      // Assert
      expect(context.arc).toBeCalledWith(
        0,
        0,
        expectedHandleRadius,
        0,
        2 * Math.PI
      );
    });

    it('uses the radius on the handle, if one is specified', () => {
      // Setup
      const expectedHandleRadius = 10;
      const handles = [
        {
          x: 0,
          y: 0,
          radius: expectedHandleRadius,
        },
        {
          x: 0,
          y: 0,
        },
      ];

      state.handleRadius = 20;
      external.cornerstone.pixelToCanvas.mockReturnValue({
        x: 0,
        y: 0,
      });

      // Call
      drawHandles(context, {}, handles);

      // Assert
      expect(context.arc).toHaveBeenCalledTimes(2);
      expect(context.arc).toHaveBeenNthCalledWith(
        1,
        ...[0, 0, expectedHandleRadius, 0, 2 * Math.PI]
      );
      expect(context.arc).not.toHaveBeenNthCalledWith(
        2,
        ...[0, 0, expectedHandleRadius, 0, 2 * Math.PI]
      );
    });
  });
});
