import { expect } from 'chai';
import pointInFreehand from '../../../src/util/freehand/pointInFreehand.js';
import { FreehandHandleData } from '../../../src/util/freehand/FreehandHandleData.js'


describe('#pointInFreehand', function() {
  let dataHandles;

  beforeEach(() => {
    // Simple square
    const handle0 = new FreehandHandleData({
        x: 0.0,
        y: 0.0
    });
    const handle1 = new FreehandHandleData({
        x: 0.0,
        y: 1.0
    });
    const handle2 = new FreehandHandleData({
        x: 1.0,
        y: 1.0
    });
    const handle3 = new FreehandHandleData({
        x: 1.0,
        y: 0.0
    });

    dataHandles = [
      handle0,
      handle1,
      handle2,
      handle3
    ];
  });

  it('should return true if the point is inside the polygon', function() {
    const point = {
      x: 0.5,
      y: 0.5
    };
    const isInside = pointInFreehand(dataHandles, point);

    expect(isInside).to.not.be.undefined;
    expect(isInside).to.be.true;
  });

  it('should return false if the point is outside the object, to the right', function() {
    const point = {
      x: 2.0,
      y: 0.5
    };
    const isInside = pointInFreehand(dataHandles, point);

    expect(isInside).to.not.be.undefined;
    expect(isInside).to.be.false;
  });

  it('should return false if the point is outside the object, to the left', function() {
    const point = {
      x: -1.0,
      y: 0.5
    };
    const isInside = pointInFreehand(dataHandles, point);

    expect(isInside).to.not.be.undefined;
    expect(isInside).to.be.false;
  });

  it('should return false if on the line exactly', function() {
    const point = {
      x: 1.0,
      y: 0.5
    };
    const isInside = pointInFreehand(dataHandles, point);

    expect(isInside).to.not.be.undefined;
    expect(isInside).to.be.false;
  });

  it('should return false if the point is outside the object, above and bellow', function() {
    const point1 = {
      x: 0.5,
      y: 2.0
    };
    const point2 = {
      x: 0.5,
      y: -1.0
    };
    const isInside1 = pointInFreehand(dataHandles, point1);
    const isInside2 = pointInFreehand(dataHandles, point2);

    expect(isInside1).to.not.be.undefined;
    expect(isInside1).to.be.false;
    expect(isInside2).to.not.be.undefined;
    expect(isInside2).to.be.false;
  });

});
