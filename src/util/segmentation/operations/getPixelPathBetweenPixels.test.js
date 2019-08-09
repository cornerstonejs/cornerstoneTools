import getPixelPathBetweenPixels from './getPixelPathBetweenPixels.js';

jest.mock('../../../externalModules.js', () => ({
  cornerstoneMath: {
    point: {
      distance: (p1, p2) =>
        Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)),
    },
    getPixels: () => [100, 100, 100, 100, 4, 5, 100, 3, 6],
  },
}));

describe('getPixelPathBetweenPixels.js', () => {
  describe('getPixelPathBetweenPixels', () => {
    it('should generate 41 points between (0,0) and (40,25)', () => {
      const path = getPixelPathBetweenPixels(
        {
          x: 0,
          y: 0,
        },
        {
          x: 40,
          y: 25,
        }
      );

      expect(path.length).toEqual(41);
      expect(path[16].x).toEqual(16);
      expect(path[16].y).toEqual(15);
    });
  });
});
