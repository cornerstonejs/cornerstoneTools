import getUltraSoundPixelSpacing from './getUltraSoundPixelSpacing.js';

describe('getPixelSpacing', () => {
  it('should return rowPixelSpacing and colPixelSpacing from ultrasoundRegionSequence', () => {
    const ultrasoundRegionSequence = [
      {
        physicalUnitsXDirection: 3,
        physicalUnitsYDirection: 3,
        physicalDeltaX: 1,
        physicalDeltaY: 1,
        regionLocationMinX0: 0,
        regionLocationMinY0: 0,
        regionLocationMaxX1: 4,
        regionLocationMaxY1: 4,
      },
    ];

    const measurementData = {
      handles: {
        start: { x: 1, y: 2 },
        end: { x: 3, y: 4 },
      },
    };

    const result = getUltraSoundPixelSpacing(
      ultrasoundRegionSequence,
      measurementData
    );

    expect(result).toEqual({
      rowPixelSpacing: 10, // 1 * 10
      colPixelSpacing: 10, // 1 * 10
      unit: 'mm',
    });
  });

  it('should return rowPixelSpacing and colPixelSpacing as undefined if physicalUnitsXDirection and physicalUnitsYDirection are not 3', () => {
    const ultrasoundRegionSequence = [
      {
        physicalUnitsXDirection: 2,
        physicalUnitsYDirection: 2,
        physicalDeltaX: 1,
        physicalDeltaY: 1,
        regionLocationMinX0: 0,
        regionLocationMinY0: 0,
        regionLocationMaxX1: 4,
        regionLocationMaxY1: 4,
      },
    ];

    const measurementData = {
      handles: {
        start: { x: 1, y: 2 },
        end: { x: 3, y: 4 },
      },
    };

    const result = getUltraSoundPixelSpacing(
      ultrasoundRegionSequence,
      measurementData
    );

    expect(result).toEqual({
      rowPixelSpacing: undefined,
      colPixelSpacing: undefined,
      unit: 'pix',
    });
  });

  it('should return undefined pixel spacings if physicalDeltaX and physicalDeltaY are almost zero', () => {
    const ultrasoundRegionSequence = [
      {
        physicalUnitsXDirection: 3,
        physicalUnitsYDirection: 3,
        physicalDeltaX: 1e-8, // Almost zero
        physicalDeltaY: 1e-8, // Almost zero
        regionLocationMinX0: 0,
        regionLocationMinY0: 0,
        regionLocationMaxX1: 4,
        regionLocationMaxY1: 4,
      },
    ];

    const measurementData = {
      handles: {
        start: { x: 1, y: 2 },
        end: { x: 3, y: 4 },
      },
    };

    const result = getUltraSoundPixelSpacing(
      ultrasoundRegionSequence,
      measurementData
    );

    expect(result).toEqual({
      rowPixelSpacing: undefined,
      colPixelSpacing: undefined,
      unit: 'pix',
    });
  });

  it('should return undefined pixel spacings if physicalDeltaX and physicalDeltaY are NaN', () => {
    const ultrasoundRegionSequence = [
      {
        physicalUnitsXDirection: 3,
        physicalUnitsYDirection: 3,
        physicalDeltaX: NaN,
        physicalDeltaY: NaN,
        regionLocationMinX0: 0,
        regionLocationMinY0: 0,
        regionLocationMaxX1: 4,
        regionLocationMaxY1: 4,
      },
    ];
    const measurementData = {
      handles: {
        start: { x: 1, y: 2 },
        end: { x: 3, y: 4 },
      },
    };

    const result = getUltraSoundPixelSpacing(
      ultrasoundRegionSequence,
      measurementData
    );

    expect(result).toEqual({
      rowPixelSpacing: undefined,
      colPixelSpacing: undefined,
      unit: 'pix',
    });
  });

  it('should return rowPixelSpacing and colPixelSpacing as undefined if physicalDeltaX and physicalDeltaY are 0', () => {
    const ultrasoundRegionSequence = [
      {
        physicalUnitsXDirection: 3,
        physicalUnitsYDirection: 3,
        physicalDeltaX: 0,
        physicalDeltaY: 0,
        regionLocationMinX0: 0,
        regionLocationMinY0: 0,
        regionLocationMaxX1: 4,
        regionLocationMaxY1: 4,
      },
    ];

    const measurementData = {
      handles: {
        start: { x: 1, y: 2 },
        end: { x: 3, y: 4 },
      },
    };

    const result = getUltraSoundPixelSpacing(
      ultrasoundRegionSequence,
      measurementData
    );

    expect(result).toEqual({
      rowPixelSpacing: undefined,
      colPixelSpacing: undefined,
      unit: 'pix',
    });
  });

  it('should return rowPixelSpacing and colPixelSpacing as undefined if measurement handles are not in bounds', () => {
    const ultrasoundRegionSequence = [
      {
        physicalUnitsXDirection: 3,
        physicalUnitsYDirection: 3,
        physicalDeltaX: 1,
        physicalDeltaY: 1,
        regionLocationMinX0: 0,
        regionLocationMinY0: 0,
        regionLocationMaxX1: 4,
        regionLocationMaxY1: 4,
      },
    ];

    const measurementData = {
      handles: {
        start: { x: 10, y: 20 },
        end: { x: 30, y: 40 },
      },
    };

    const result = getUltraSoundPixelSpacing(
      ultrasoundRegionSequence,
      measurementData
    );

    expect(result).toEqual({
      rowPixelSpacing: undefined,
      colPixelSpacing: undefined,
      unit: 'pix',
    });
  });
});
