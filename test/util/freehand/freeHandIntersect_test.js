import { expect } from 'chai';
import freeHandIntersect from '../../../src/util/freehand/freeHandIntersect.js';
import { FreehandHandleData } from '../../../src/util/freehand/FreehandHandleData.js'


describe('#freeHandIntersect', function() {
  let dataHandles;

  beforeEach(() => {
    // First 3 corners of a square.
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

    dataHandles = [
      handle0,
      handle1,
      handle2
    ];
  });

  it('should return true if a new handle crosses any previous line', function() {
    const candidateHandle = new FreehandHandleData({
      x: -0.5,
      y: 0.5
    });
    const doesIntersect = freeHandIntersect.newHandle(candidateHandle, dataHandles);

    expect(doesIntersect).to.not.be.undefined;
    expect(doesIntersect).to.be.true;
  });

  it('should return false if a new handle doesn\'t cross any previous line', function() {
    const candidateHandle = new FreehandHandleData({
      x: 0.5,
      y: 0.5
    });
    const doesIntersect = freeHandIntersect.newHandle(candidateHandle, dataHandles);

    expect(doesIntersect).to.not.be.undefined;
    expect(doesIntersect).to.be.false;
  });

  it('should return true if the line created by finishing the polygon crosses any previous line', function() {
    //Add an additional handle above the triangle such the line (handle3,handle0) crosses (handle1,handle2).
    const handle3 = new FreehandHandleData({
      x: 0.5,
      y: 1.5
    });

    dataHandles.push(handle3);


    const doesIntersect = freeHandIntersect.end(dataHandles);

    expect(doesIntersect).to.not.be.undefined;
    expect(doesIntersect).to.be.true;
  });

  it('should return false if the line created by finishing the polygon doesn\'t cross any previous line', function() {
    const doesIntersect = freeHandIntersect.end(dataHandles);

    expect(doesIntersect).to.not.be.undefined;
    expect(doesIntersect).to.be.false;
  });

  it('should return true if one moves a polygon\'s vertex such that it causes an lines to cross', function() {
    //add the 4th corner of the square first.
    const handle3 = new FreehandHandleData({
      x: 1.0,
      y: 0.0
    });
    dataHandles.push(handle3);

    //Move handle2 so that it crosses line (handle0,handle1)
    const modifiedHandleId = 2;

    dataHandles[modifiedHandleId].x = -0.5;
    dataHandles[modifiedHandleId].y = 0.5;

    const doesIntersect = freeHandIntersect.modify(dataHandles, modifiedHandleId);

    expect(doesIntersect).to.not.be.undefined;
    expect(doesIntersect).to.be.true;
  });

  it('should return false if one moves a polygon\'s vertex a bit such that no lines cross', function() {
    //add the 4th corner of the square first.
    const handle3 = new FreehandHandleData({
      x: 1.0,
      y: 0.0
    });
    dataHandles.push(handle3);

    //Move handle2 in a non disruptive way.
    const modifiedHandleId = 2;

    dataHandles[modifiedHandleId].x = 2.0;
    dataHandles[modifiedHandleId].y = 2.0;

    const doesIntersect = freeHandIntersect.modify(dataHandles, modifiedHandleId);

    expect(doesIntersect).to.not.be.undefined;
    expect(doesIntersect).to.be.false;
  });

});
