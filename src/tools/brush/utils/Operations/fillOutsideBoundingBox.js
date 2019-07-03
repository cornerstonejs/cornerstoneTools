export default function fillOutsideBoundingBox(
  topLeft,
  bottomRight,
  segmentationData,
  image,
  labelValue = 1
) {
  let painted = 0;
  const { width, height } = image;

  // Loop until top of bounding box from top of image, color the entire row
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < topLeft[1]; j++) {
      segmentationData[j * width + i] = labelValue;

      painted++;
    }
  }

  // Loop within rows of bounding box, to the left of the box
  for (let i = 0; i < topLeft[0]; i++) {
    for (let j = topLeft[1]; j < bottomRight[1]; j++) {
      segmentationData[j * width + i] = labelValue;

      painted++;
    }
  }

  // Loop within rows of bounding box, to the right of the box
  for (let i = bottomRight[0]; i < width; i++) {
    for (let j = topLeft[1]; j < bottomRight[1]; j++) {
      segmentationData[j * width + i] = labelValue;

      painted++;
    }
  }

  // Loop from bottom of bounding box until bottom of image, color entire row
  for (let i = 0; i < width; i++) {
    for (let j = bottomRight[1]; j < height; j++) {
      segmentationData[j * width + i] = labelValue;

      painted++;
    }
  }

  return painted;
}
