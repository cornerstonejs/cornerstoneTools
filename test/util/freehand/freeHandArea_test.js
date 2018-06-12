import { expect } from 'chai';
import freeHandArea from '../../../src/util/freehand/freeHandArea.js';
import { FreehandHandleData } from '../../../src/util/freehand/FreehandHandleData.js'


describe('#freeHandArea', function() {
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

  it('should return the area enclosed in dataHandles', function () {
    const area = freeHandArea(dataHandles, false);

    expect(area).to.not.be.undefined;
    expect(area).to.be.equal(1.0);
  });

  it('should scale if the parameter is given.', function () {
    const area = freeHandArea(dataHandles, 10.0);

    expect(area).to.not.be.undefined;
    expect(area).to.be.equal(10.0);
  });

});
