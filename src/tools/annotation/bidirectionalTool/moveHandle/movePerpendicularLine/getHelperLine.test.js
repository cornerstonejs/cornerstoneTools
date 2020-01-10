import getHelperLine from './getHelperLine';
import getLineVector from '../../utils/getLineVector';

function createPoint(x, y) {
  return {
    x,
    y,
  };
}

describe('getHelperLine.js', () => {
  it('helper line for fixed start point', () => {
    const columnPixelSpacing = 1;
    const rowPixelSpacing = 0.5;
    const perpendicularStart = createPoint(0, 0);
    const perpendicularEnd = createPoint(10, 10);
    const proposedPoint = createPoint(20, 20);
    const fixedPoint = perpendicularStart;

    const baseData = {
      columnPixelSpacing,
      rowPixelSpacing,
      perpendicularEnd,
      fixedPoint,
    };

    const vector = getLineVector(
      columnPixelSpacing,
      rowPixelSpacing,
      perpendicularStart,
      perpendicularEnd
    );

    const helperLine = getHelperLine(baseData, proposedPoint, vector);

    const expectedEndX = -2014070982048610;
    const expectedEndY = 8056283928194540;

    expect(helperLine.start.x).toEqual(20);
    expect(helperLine.start.y).toEqual(20);
    expect(helperLine.end.x).toEqual(expectedEndX);
    expect(helperLine.end.y).toEqual(expectedEndY);
  });

  it('helper line for fixed end point', () => {
    const columnPixelSpacing = 1;
    const rowPixelSpacing = 0.5;
    const perpendicularStart = createPoint(10, 20);
    const perpendicularEnd = createPoint(40, 50);
    const proposedPoint = createPoint(60, 80);
    const fixedPoint = perpendicularEnd;

    const baseData = {
      columnPixelSpacing,
      rowPixelSpacing,
      perpendicularEnd,
      fixedPoint,
    };

    const vector = getLineVector(
      columnPixelSpacing,
      rowPixelSpacing,
      perpendicularStart,
      perpendicularEnd
    );

    const helperLine = getHelperLine(baseData, proposedPoint, vector);

    const expectedEndX = 2014070982048690.2;
    const expectedEndY = -8056283928194441;

    expect(helperLine.start.x).toEqual(60);
    expect(helperLine.start.y).toEqual(80);
    expect(helperLine.end.x).toEqual(expectedEndX);
    expect(helperLine.end.y).toEqual(expectedEndY);
  });
});
