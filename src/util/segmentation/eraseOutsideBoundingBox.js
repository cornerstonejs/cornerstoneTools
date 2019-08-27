import eraseIfSegmentIndex from './eraseIfSegmentIndex';

/**
 * EraseOutsideBoundingBox - Erase all pixels labeled with the activeSegmentIndex,
 * outside the bouding box defined by the `topLeft` and `topRight`.
 * @param  {} evt The Cornerstone event.
 * @param {} operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @param {number[]} topLeft The top left of the bounding box.
 * @param {number[]} bottomRight The bottom right of the bounding box.
 * @returns {null}
 */
export default function eraseOutsideBoundingBox(
  evt,
  operationData,
  topLeft,
  bottomRight
) {
  const eventData = evt.detail;
  const { pixelData, segmentIndex } = operationData;
  const { image } = eventData;
  const { width, height } = image;

  // Loop until top of bounding box from top of image, color the entire row
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < topLeft[1]; j++) {
      eraseIfSegmentIndex(j * width + i, pixelData, segmentIndex);
    }
  }

  // Loop within rows of bounding box, to the left of the box
  for (let i = 0; i < topLeft[0]; i++) {
    for (let j = topLeft[1]; j < bottomRight[1]; j++) {
      eraseIfSegmentIndex(j * width + i, pixelData, segmentIndex);
    }
  }

  // Loop within rows of bounding box, to the right of the box
  for (let i = bottomRight[0]; i < width; i++) {
    for (let j = topLeft[1]; j < bottomRight[1]; j++) {
      eraseIfSegmentIndex(j * width + i, pixelData, segmentIndex);
    }
  }

  // Loop from bottom of bounding box until bottom of image, color entire row
  for (let i = 0; i < width; i++) {
    for (let j = bottomRight[1]; j < height; j++) {
      eraseIfSegmentIndex(j * width + i, pixelData, segmentIndex);
    }
  }
}
