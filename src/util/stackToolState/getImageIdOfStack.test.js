import { getToolState } from '../../stateManagement/toolState.js';
import getImageIdsOfStack from './getImageIdsOfStack.js';

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

describe('getImageIdsOfStack.js', () => {
  beforeEach(() => {});

  describe('getImageIdsOfStack', () => {
    it('should return a list of imageIds of length 3, with the first entry being "example://1".', () => {
      const imageIds = getImageIdsOfStack({});

      expect(imageIds.length).toEqual(3);
      expect(imageIds[0]).toEqual('example://1');
    });
  });
});
