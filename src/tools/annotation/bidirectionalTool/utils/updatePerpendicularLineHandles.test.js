import updatePerpendicularLineHandles from './updatePerpendicularLineHandles';
import getDistanceWithPixelSpacing from './getDistanceWithPixelSpacing';

function createPoint(x, y) {
  return {
    x,
    y,
  };
}

describe('updatePerpendicularLineHandles.js', () => {
  it('perpendicular line has half the size of the long line', () => {
    const start = createPoint(0, 4);
    const end = createPoint(8, 4);
    const perpendicularStart = createPoint(8, 4);
    const perpendicularEnd = createPoint(8, 4);

    perpendicularStart.locked = true;

    const measurementData = {
      handles: {
        start,
        end,
        perpendicularStart,
        perpendicularEnd,
      },
    };

    const eventData = {
      image: {
        columnPixelSpacing: 1,
        rowPixelSpacing: 1,
      },
    };

    const result = updatePerpendicularLineHandles(eventData, measurementData);

    // Expect line to have been moved successfully
    expect(result).toEqual(true);

    // Expect perpendicular line to be in the correct position
    expect(perpendicularStart.x).toEqual(4);
    expect(perpendicularStart.y).toEqual(6);
    expect(perpendicularEnd.x).toEqual(4);
    expect(perpendicularEnd.y).toEqual(2);

    const { columnPixelSpacing, rowPixelSpacing } = eventData.image;

    const distanceLongLine = getDistanceWithPixelSpacing(
      columnPixelSpacing,
      rowPixelSpacing,
      start,
      end
    );

    const distancePerpendicularLine = getDistanceWithPixelSpacing(
      columnPixelSpacing,
      rowPixelSpacing,
      perpendicularStart,
      perpendicularEnd
    );

    // Expect perpendicular line to has half the size of the long line
    expect(distancePerpendicularLine).toEqual(distanceLongLine / 2);
  });

  it('line is not updated because start point is not locked', () => {
    const start = createPoint(0, 4);
    const end = createPoint(8, 4);
    const perpendicularStart = createPoint(8, 4);
    const perpendicularEnd = createPoint(8, 4);

    perpendicularStart.locked = false;

    const measurementData = {
      handles: {
        start,
        end,
        perpendicularStart,
        perpendicularEnd,
      },
    };

    const eventData = {
      image: {
        columnPixelSpacing: 1,
        rowPixelSpacing: 1,
      },
    };

    const result = updatePerpendicularLineHandles(eventData, measurementData);

    // Expect line to not have been moved
    expect(result).toEqual(false);
  });
});
