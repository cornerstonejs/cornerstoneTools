// SUT
import path from './path.js';
import getNewContext from './getNewContext.js';

const { createCanvas } = require('canvas');

describe('drawing/path.js', () => {
  let canvas, context;

  beforeEach(() => {
    canvas = createCanvas(200, 200);
    context = getNewContext(canvas);
  });

  it('calls the callbackFn with context', () => {
    const options = undefined;

    path(context, options, innerContext => {
      expect(innerContext).toEqual(context);
    });
  });

  it('applies color option to context', () => {
    const options = {
      color: '#ff0000',
      lineWidth: 5,
      fillStyle: 'blue',
      lineDash: [5, 15],
    };

    path(context, options, ctx => {
      expect(ctx.strokeStyle).toEqual(options.color);
    });
  });
});
