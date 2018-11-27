// SUT
import normalizeWheel from './normalizeWheel.js';

describe('internals/normalizeWheel.js', () => {
  it('returns { spinX, spinY, pixelX, pixelY }', () => {
    // Setup
    const expectedReturn = {
      spinX: 0,
      spinY: 0,
      pixelX: 0,
      pixelY: 0,
    };

    // SUT
    const result = normalizeWheel({});

    // Assert
    expect(result).toMatchObject(expectedReturn);
  });
});
