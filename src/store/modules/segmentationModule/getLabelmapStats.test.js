import { _calculateLabelmapStats } from './getLabelmapStats.js';

describe('getLabelmapsStats.js', () => {
  describe('_calculateLabelmapStats', () => {
    it('Should calculate the volume weighted statistics correctly with different slice thickness.', () => {
      const labelmap3D = {
        labelmaps2D: [
          {
            pixelData: [0, 0, 0, 0, 1, 1, 1, 1, 2],
            segmentsOnLabelmap: [1, 2],
          },
          {
            pixelData: [0, 0, 0, 1, 1, 1, 1, 2, 2],
            segmentsOnLabelmap: [1, 2],
          },
          {
            pixelData: [0, 0, 0, 0, 0, 0, 0, 0, 2],
            segmentsOnLabelmap: [2],
          },
        ],
      };

      const rowPixelSpacing = 1;
      const columnPixelSpacing = 2;

      const images = [
        {
          rowPixelSpacing,
          columnPixelSpacing,
          getPixelData: () => [0, 0, 0, 0, 1, 2, 2, 1, 0],
        },
        {
          rowPixelSpacing,
          columnPixelSpacing,
          getPixelData: () => [0, 0, 0, 1, 2, 2, 1, 0, 0],
        },
        {
          rowPixelSpacing,
          columnPixelSpacing,
          getPixelData: () => [0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
      ];

      const imagePlanes = [
        {
          imagePositionPatient: [0, 0, 0], // slice thickness: (2-0) = 2
        },
        {
          imagePositionPatient: [0, 0, 2], // Slice thickness: ((2-0) + (3-2)) / 2 = 1.5
        },
        {
          imagePositionPatient: [0, 0, 3], // Slice thickness: (3-2) = 1
        },
      ];

      // Simple calculation based on the above data.
      const volume =
        4 * rowPixelSpacing * columnPixelSpacing * 2 +
        4 * rowPixelSpacing * columnPixelSpacing * 1.5;

      const segmentIndex = 1;

      const stats = _calculateLabelmapStats(
        labelmap3D,
        images,
        imagePlanes,
        segmentIndex
      );

      console.log(stats);

      console.log(volume);

      expect(stats.max).toEqual(2);
      expect(stats.min).toEqual(1);
      expect(stats.volume).toEqual(volume);
      expect(stats.mean).toEqual(1.5);
      expect(stats.stdDev).toEqual(0.5);
    });
  });
});
