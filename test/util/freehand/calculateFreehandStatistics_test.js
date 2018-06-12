import { expect } from 'chai';
import calculateFreehandStatistics from '../../../src/util/freehand/calculateFreehandStatistics.js';
import { FreehandHandleData } from '../../../src/util/freehand/FreehandHandleData.js'

describe('#calculateFreehandStatistics', function() {
  let dataHandles;
  let boundingBox;
  let pixels = [];

  beforeEach(() => {
    // 'L' shape: 10x10 square with top right quadrant missing
    const handle0 = new FreehandHandleData({
        x: 0.0,
        y: 0.0
    });
    const handle1 = new FreehandHandleData({
        x: 0.0,
        y: 10.0
    });
    const handle2 = new FreehandHandleData({
        x: 5.0,
        y: 10.0
    });
    const handle3 = new FreehandHandleData({
        x: 5.0,
        y: 5.0
    });
    const handle4 = new FreehandHandleData({
        x: 10.0,
        y: 5.0
    });
    const handle5 = new FreehandHandleData({
        x: 10.0,
        y: 0.0
    });

    dataHandles = [
      handle0,
      handle1,
      handle2,
      handle3,
      handle4,
      handle5
    ];

    boundingBox = {
      top: 0.0,
      height: 10.0,
      left: 0.0,
      width: 10.0
    };

  });

  it('should not include pixels outside the polygon', function() {
    // create 100 dimensional pixel array
    pixels = [];
    pixels.length = 100;
    pixels.fill(0.0);

    // Set a pixel outside the polygon to a high value;
    pixels[78] = 1000.0;

    const statisticsObj = calculateFreehandStatistics(pixels, boundingBox, dataHandles);

    expect(statisticsObj.mean).to.be.equal(0.0);
    expect(statisticsObj.variance).to.be.equal(0.0);
    expect(statisticsObj.stdDev).to.be.equal(0.0);

  });

  it('should calculate that stats of pixels within the polygon', function() {
    // create 100 dimensional pixel array
    pixels = [];
    pixels.length = 100;

    // Set pixels within (0,0),(0,5),(10,5),(10,0) to 1
    for (let i = 0; i < 50; i++) {
      pixels[i] = 1.0;
    }
    // Set pixels within (0,5),(0,10),(10,10),(10,5) to 4
    for (let i = 50; i < 100; i++) {
      pixels[i] = 4.0;
    }

    const statisticsObj = calculateFreehandStatistics(pixels, boundingBox, dataHandles);

    expect(statisticsObj.mean).to.be.equal(2.0);
    expect(statisticsObj.variance).to.be.equal(2.0);
    expect(statisticsObj.stdDev).to.be.equal(Math.sqrt(2.0));
  });

});
