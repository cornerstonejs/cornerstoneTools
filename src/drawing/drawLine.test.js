// SUT
import drawLine from './drawLine.js';

/* ~ Setup
 * In order to mock properly, Jest needs jest.mock('moduleName') to be in the
 * same scope as the require/import statement.
 */
import getNewContext from './getNewContext.js';
import external from './../externalModules.js';

jest.mock('./../externalModules.js');

const { createCanvas } = require('canvas');

describe('drawing/drawLine.js', () => {
  let canvas, context;

  beforeEach(() => {
    jest.resetAllMocks();
    canvas = createCanvas(200, 200);
    context = getNewContext(canvas);

    context.moveTo = jest.fn();
    context.lineTo = jest.fn();
  });

  it('uses transformed start/end values when coordSystem is "pixel"', () => {
    // Setup
    const options = undefined;
    const start = {
      x: 0,
      y: 0,
    };
    const end = {
      x: 5,
      y: 5,
    };
    const transformedCoords = {
      x: 10,
      y: 10,
    };
    const coordSystem = 'pixel';

    external.cornerstone.pixelToCanvas.mockReturnValue(transformedCoords);

    // Call
    drawLine(context, undefined, start, end, options, coordSystem);

    // Assert
    expect(external.cornerstone.pixelToCanvas).toHaveBeenCalledTimes(2);
    expect(context.moveTo).toHaveBeenCalledWith(
      transformedCoords.x,
      transformedCoords.y
    );
    expect(context.lineTo).toHaveBeenCalledWith(
      transformedCoords.x,
      transformedCoords.y
    );
  });

  it('uses provided start/end values when coordSystem is "canvas"', () => {
    // Setup
    const options = undefined;
    const start = {
      x: 0,
      y: 0,
    };
    const end = {
      x: 5,
      y: 5,
    };
    const coordSystem = 'canvas';

    // Call
    drawLine(context, undefined, start, end, options, coordSystem);

    // Assert
    expect(external.cornerstone.pixelToCanvas).toHaveBeenCalledTimes(0);
    expect(context.moveTo).toHaveBeenCalledWith(start.x, start.y);
    expect(context.lineTo).toHaveBeenCalledWith(end.x, end.y);
  });
});
