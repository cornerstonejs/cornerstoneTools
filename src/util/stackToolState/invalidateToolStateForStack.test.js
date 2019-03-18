import { getToolState } from '../../stateManagement/toolState.js';
import { globalImageIdSpecificToolStateManager } from '../../stateManagement/imageIdSpecificStateManager.js';
import invalidateToolStateForStack from './invalidateToolStateForStack.js';

jest.mock('./../../stateManagement/toolState.js', () => ({
  getToolState: jest.fn((element, toolName) => {
    return {
      data: [
        {
          imageIds: ['example://1', 'example://2', 'example://3'],
        },
      ],
    };
  }),
}));

jest.mock('../../stateManagement/imageIdSpecificStateManager.js', () => ({
  globalImageIdSpecificToolStateManager: {
    saveToolState: jest.fn(() => {
      return JSON.parse(
        '{"example://1":{"EllipticalRoi":{"data":[{"visible":true,"active":false,"invalidated":false,"handles":{"start":{"x":44.16000000000008,"y":78.08,"highlight":true,"active":false},"end":{"x":119.68000000000006,"y":125.44,"highlight":true,"active":false},"textBox":{"active":false,"hasMoved":false,"movesIndependently":false,"drawnIndependently":true,"allowedOutsideImage":true,"hasBoundingBox":true,"x":119.68000000000006,"y":101.75999999999999,"boundingBox":{"width":213.5500030517578,"height":45,"left":947,"top":57}}},"cachedStats":{"area":2805.442239655685,"count":2795,"mean":58.764937388193204,"variance":538.9919727599436,"stdDev":23.216200652991084,"min":4,"max":149}},{"visible":true,"active":false,"invalidated":false,"handles":{"start":{"x":55.680000000000064,"y":162.56,"highlight":true,"active":false},"end":{"x":128.6400000000001,"y":207.36,"highlight":true,"active":false},"textBox":{"active":false,"hasMoved":false,"movesIndependently":false,"drawnIndependently":true,"allowedOutsideImage":true,"hasBoundingBox":true,"x":128.6400000000001,"y":184.96,"boundingBox":{"width":213.5500030517578,"height":45,"left":954.0000000000001,"top":122}}},"cachedStats":{"area":2580.0329667606175,"count":2560,"mean":80.067578125,"variance":3268.6864488220217,"stdDev":57.172427347647414,"min":0,"max":223}}]},"Length":{"data":[{"visible":true,"active":false,"handles":{"start":{"x":167.03999999999996,"y":244.48000000000002,"highlight":true,"active":false},"end":{"x":213.12000000000012,"y":222.72,"highlight":true,"active":false},"textBox":{"active":false,"hasMoved":false,"movesIndependently":false,"drawnIndependently":true,"allowedOutsideImage":true,"hasBoundingBox":true,"x":213.12000000000012,"y":222.72,"boundingBox":{"width":76.73332977294922,"height":25,"left":1030,"top":161.5}}},"length":45.78386724600721,"invalidated":false}]}},"example://3":{"Length":{"data":[{"visible":true,"active":false,"handles":{"start":{"x":74.88000000000011,"y":66.56,"highlight":true,"active":false},"end":{"x":133.76,"y":117.76,"highlight":true,"active":false},"textBox":{"active":false,"hasMoved":false,"movesIndependently":false,"drawnIndependently":true,"allowedOutsideImage":true,"hasBoundingBox":true,"x":133.76,"y":117.76,"boundingBox":{"width":76.73332977294922,"height":25,"left":968,"top":79.5}}},"length":70.1028530089895,"invalidated":false}]}},"example://2":{"EllipticalRoi":{"data":[{"visible":true,"active":false,"invalidated":false,"handles":{"start":{"x":36.48000000000002,"y":107.52,"highlight":true,"active":false},"end":{"x":109.44000000000005,"y":186.88,"highlight":true,"active":false},"textBox":{"active":false,"hasMoved":false,"movesIndependently":false,"drawnIndependently":true,"allowedOutsideImage":true,"hasBoundingBox":true,"x":109.44000000000005,"y":147.2,"boundingBox":{"width":213.5500030517578,"height":45,"left":939,"top":92.49999999999999}}},"cachedStats":{"area":4529.3912083130845,"count":4512,"mean":71.77482269503547,"variance":2218.1926462451574,"stdDev":47.09769257877882,"min":0,"max":240}}]}},"imageIdfromADifferentStack":{"Length":{"data":[{"visible":true,"active":false,"handles":{"start":{"x":167.03999999999996,"y":244.48000000000002,"highlight":true,"active":false},"end":{"x":213.12000000000012,"y":222.72,"highlight":true,"active":false},"textBox":{"active":false,"hasMoved":false,"movesIndependently":false,"drawnIndependently":true,"allowedOutsideImage":true,"hasBoundingBox":true,"x":213.12000000000012,"y":222.72,"boundingBox":{"width":76.73332977294922,"height":25,"left":1030,"top":161.5}}},"length":45.78386724600721,"invalidated":false}]}}}'
      );
    }),
  },
}));

describe('invalidateToolStateForStack.js', () => {
  beforeEach(() => {});

  describe('invalidateToolStateForStack', () => {
    it('should invalidate the whole toolState for any imageIds in the stack.', () => {
      const toolState = invalidateToolStateForStack({});

      const ellipticalRoiOnStack =
        toolState['example://1'].EllipticalRoi.data[0];
      const lengthOnStack = toolState['example://1'].Length.data[0];

      const lengthOffStack =
        toolState['imageIdfromADifferentStack'].Length.data[0];

      expect(ellipticalRoiOnStack.invalidated).toBe(true);
      expect(lengthOnStack.invalidated).toBe(true);
      expect(lengthOffStack.invalidated).toBe(false);
    });

    it('should invalidate the Length toolState for any imageIds in the stack.', () => {
      const toolState = invalidateToolStateForStack({}, 'Length');

      const ellipticalRoiOnStack =
        toolState['example://1'].EllipticalRoi.data[0];
      const lengthOnStack = toolState['example://1'].Length.data[0];

      const lengthOffStack =
        toolState['imageIdfromADifferentStack'].Length.data[0];

      expect(ellipticalRoiOnStack.invalidated).toBe(false);
      expect(lengthOnStack.invalidated).toBe(true);
      expect(lengthOffStack.invalidated).toBe(false);
    });
  });
});
