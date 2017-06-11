import { expect } from 'chai';
import copyPoints from '../../src/util/copyPoints.js';

describe('#copyPoints', function () {
  let points;

  beforeEach(() => {
    points = {
      page: {
        x: 1.2,
        y: 2.3
      },
      image: {
        x: 3.4,
        y: 4.5
      },
      client: {
        x: 5.6,
        y: 6.7
      },
      canvas: {
        x: 7.8,
        y: 8.9
      }
    }
  });

  it('should not return the same object as a copy', function () {
    const pointsCopy = copyPoints(points);

    expect(pointsCopy).to.not.be.equal(points);
  });

  it('should return an object containing a copy of `page` point', function () {
    const pointsCopy = copyPoints(points);

    expect(pointsCopy.page).to.not.be.undefined;
    expect(pointsCopy.page).to.not.be.equal(points.page);
    expect(pointsCopy.page.x).to.be.equal(points.page.x);
    expect(pointsCopy.page.y).to.be.equal(points.page.y);
  });

  it('should return an object containing a copy of `image` point', function () {
    const pointsCopy = copyPoints(points);

    expect(pointsCopy.image).to.not.be.undefined;
    expect(pointsCopy.image).to.not.be.equal(points.image);
    expect(pointsCopy.image.x).to.be.equal(points.image.x);
    expect(pointsCopy.image.y).to.be.equal(points.image.y);
  });

  it('should return an object containing a copy of `client` point', function () {
    const pointsCopy = copyPoints(points);

    expect(pointsCopy.client).to.not.be.undefined;
    expect(pointsCopy.client).to.not.be.equal(points.client);
    expect(pointsCopy.client.x).to.be.equal(points.client.x);
    expect(pointsCopy.client.y).to.be.equal(points.client.y);
  });

  it('should return an object containing a copy of `canvas` point', function () {
    const pointsCopy = copyPoints(points);

    expect(pointsCopy.canvas).to.not.be.undefined;
    expect(pointsCopy.canvas).to.not.be.equal(points.canvas);
    expect(pointsCopy.canvas.x).to.be.equal(points.canvas.x);
    expect(pointsCopy.canvas.y).to.be.equal(points.canvas.y);
  });

});
