import copyPoints from './copyPoints.js';

describe('util/copyPoints.js', function() {
  let points;

  beforeEach(() => {
    points = {
      page: {
        x: 1.2,
        y: 2.3,
      },
      image: {
        x: 3.4,
        y: 4.5,
      },
      client: {
        x: 5.6,
        y: 6.7,
      },
      canvas: {
        x: 7.8,
        y: 8.9,
      },
    };
  });

  it('should not return the same object as a copy', function() {
    const pointsCopy = copyPoints(points);

    expect(pointsCopy).not.toBe(points);
  });

  it('should return an object containing a copy of `page` point', function() {
    const pointsCopy = copyPoints(points);

    expect(pointsCopy.page).not.toBe(points.page);
    expect(pointsCopy.page.x).toEqual(points.page.x);
    expect(pointsCopy.page.y).toEqual(points.page.y);
  });

  it('should return an object containing a copy of `image` point', function() {
    const pointsCopy = copyPoints(points);

    expect(pointsCopy.image).not.toBe(points.image);
    expect(pointsCopy.image.x).toEqual(points.image.x);
    expect(pointsCopy.image.y).toEqual(points.image.y);
  });

  it('should return an object containing a copy of `client` point', function() {
    const pointsCopy = copyPoints(points);

    expect(pointsCopy.client).not.toBe(points.client);
    expect(pointsCopy.client.x).toEqual(points.client.x);
    expect(pointsCopy.client.y).toEqual(points.client.y);
  });

  it('should return an object containing a copy of `canvas` point', function() {
    const pointsCopy = copyPoints(points);

    expect(pointsCopy.canvas).not.toBe(points.canvas);
    expect(pointsCopy.canvas.x).toEqual(points.canvas.x);
    expect(pointsCopy.canvas.y).toEqual(points.canvas.y);
  });
});
