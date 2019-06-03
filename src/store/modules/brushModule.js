import external from './../../externalModules.js';
import { getToolState } from '../../stateManagement/toolState.js';
import getNewBrushColorMap from '../../util/brush/getNewBrushColorMap.js';
import labelmapStats from '../../util/brush/labelmapStats.js';

import { getLogger } from '../../util/logger.js';

const logger = getLogger('store:modules:brushModule');

const state = {
  colorLutTables: {},
  radius: 10,
  minRadius: 1,
  maxRadius: 50,
  alpha: 0.6,
  alphaOfInactiveLabelmap: 0.2,
  colorMapId: 'BrushColorMap',
  segmentationMetadata: {},
  series: {},
};

/**
 * getLabelmapStats - returns the maximum pixel value, mean and standard
 * deviation of the segment given by the segmentIndex of the scan on the element.
 *
 * @param  {HTMLElement} element  The cornerstone enabled element.
 * @param  {number} segmentIndex  The segment index to query.
 * @returns {object}              An object containing the maximum pixel value,
 *                                the mean and the standard deviation.
 */
function getLabelmapStats(element, segmentIndex) {
  return new Promise(resolve => {
    const cornerstone = external.cornerstone;
    const stackState = getToolState(element, 'stack');
    const stackData = stackState.data[0];
    const imageIds = stackState.data[0].imageIds;
    const firstImageId = imageIds[0];

    const brushStackState = state.series[firstImageId];

    if (!brushStackState) {
      resolve();
    }

    const activeLabelmapIndex = brushStackState.activeLabelmapIndex;
    const labelmap3D = brushStackState.labelmaps3D[activeLabelmapIndex];
    const labelmap3Dbuffer = labelmap3D.buffer;

    const imagePromises = [];

    for (let i = 0; i < imageIds.length; i++) {
      imagePromises.push(cornerstone.loadAndCacheImage(imageIds[i]));
    }

    Promise.all(imagePromises).then(images => {
      const imagePixelData = [];

      const { rows, columns } = images[0];

      for (let i = 0; i < images.length; i++) {
        imagePixelData.push(images[i].getPixelData());
      }

      logger.warn(imagePixelData);

      const stats = labelmapStats(
        labelmap3Dbuffer,
        imagePixelData,
        rows * columns,
        segmentIndex
      );
      resolve(stats);
    });
  });
}

/**
 * setActiveLabelmap - Sets the active labelmap for the stack displayed on this
 * elemenet to the labelmap given by the labelmapIndex. Creates the labelmap if
 * it doesn't exist.
 *
 * @param  {HTMLElement} element           The cornerstone enabled element.
 * @param  {number} labelmapIndex = 0 The index of the labelmap.
 * @returns {null}
 */
function setActiveLabelmap(element, labelmapIndex = 0) {
  const cornerstone = external.cornerstone;
  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];
  const enabledElement = cornerstone.getEnabledElement(element);
  const { rows, columns } = enabledElement.image;
  const numberOfFrames = stackData.imageIds.length;
  const firstImageId = stackData.imageIds[0];

  let brushStackState = state.series[firstImageId];

  if (!state.colorLutTables[`${state.colorMapId}_${labelmapIndex}`]) {
    initColorMap(labelmapIndex);
  }

  if (brushStackState) {
    brushStackState.activeLabelmapIndex = labelmapIndex;

    if (!brushStackState.labelmaps3D[labelmapIndex]) {
      addLabelmap3D(
        brushStackState,
        labelmapIndex,
        rows * columns * numberOfFrames
      );
    }
  } else {
    state.series[firstImageId] = {
      activeLabelmapIndex: labelmapIndex,
      labelmaps3D: [],
    };

    brushStackState = state.series[firstImageId];

    addLabelmap3D(
      brushStackState,
      labelmapIndex,
      rows * columns * numberOfFrames
    );
  }
}

/**
 * getBrushColor - Returns the brush color as a string for the active segment of
 * the active labelmap for the series displayed on the element.
 *
 * @param  {HTMLElement} element        The cornerstone enabled element.
 * @param  {boolean} drawing = false    Whether the user is drawing or not.
 * @returns {string}                    An rgba value as a string.
 */
function getBrushColor(element, drawing = false) {
  const cornerstone = external.cornerstone;
  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];
  const firstImageId = stackData.imageIds[0];

  const brushStackState = state.series[firstImageId];

  let color;

  if (brushStackState) {
    const activeLabelmapIndex = brushStackState.activeLabelmapIndex;
    const labelmap3D = brushStackState.labelmaps3D[activeLabelmapIndex];

    if (labelmap3D) {
      const activeDrawColorId = labelmap3D.activeDrawColorId;

      color =
        state.colorLutTables[`${state.colorMapId}_${activeLabelmapIndex}`][
          activeDrawColorId
        ];
    } else {
      // Just set to new labelmap index
    }
  } else {
    // No data yet, make brush the default color of colormap 0.
    color = state.colorLutTables[`${state.colorMapId}_0`][1];
  }

  return drawing
    ? `rgba(${color[[0]]}, ${color[[1]]}, ${color[[2]]}, 1.0 )`
    : `rgba(${color[[0]]}, ${color[[1]]}, ${color[[2]]}, 0.8 )`;
}

/**
 * _changeBrushColor - Changes the active segment
 *
 * @param  {HTMLElement} element                         The cornerstone enabled element.
 * @param  {boolean} increaseOrDecrease = 'increase' Whether to increase/decrease
 *                                                the activeLabelmapIndex.
 * @returns {null}
 */
function _changeBrushColor(element, increaseOrDecrease = 'increase') {
  const cornerstone = external.cornerstone;
  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];
  const firstImageId = stackData.imageIds[0];

  const brushStackState = state.series[firstImageId];

  if (!brushStackState) {
    return;
  }

  const activeLabelmapIndex = brushStackState.activeLabelmapIndex;
  const labelmap3D = brushStackState.labelmaps3D[activeLabelmapIndex];

  switch (increaseOrDecrease) {
    case 'increase':
      labelmap3D.activeDrawColorId++;

      if (labelmap3D.activeDrawColorId > segmentsPerLabelmap) {
        labelmap3D.activeDrawColorId = 1;
      }
      break;
    case 'decrease':
      labelmap3D.activeDrawColorId--;

      if (labelmap3D.activeDrawColorId <= 0) {
        labelmap3D.activeDrawColorId = segmentsPerLabelmap;
      }
      break;
  }
}

/*
function setLabelmaps3DForFirstImageId(firstImageId, buffer, labelmapIndex) {
  for
}
*/

/**
 * getLabelmaps3D - Returns the labelmaps associated with the series displayed
 * in the element, the activeLabelmapIndex and the currentImageIdIndex.
 *
 * @param  {HTMLElement} element  The cornerstone enabled element.
 * @returns {object}              An object containing the 3D labelmaps,
 *                                the activeLabelmapIndex amd the currentImageIdIndex.
 */
function getLabelmaps3D(element) {
  const cornerstone = external.cornerstone;
  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];

  const firstImageId = stackData.imageIds[0];
  const brushStackState = state.series[firstImageId];

  let labelmaps3D;
  let activeLabelmapIndex;

  if (brushStackState) {
    labelmaps3D = brushStackState.labelmaps3D;
    activeLabelmapIndex = brushStackState.activeLabelmapIndex;
  }

  return {
    labelmaps3D,
    activeLabelmapIndex,
    currentImageIdIndex: stackData.currentImageIdIndex,
  };
}

/**
 * getLabelmapBuffers - Returns the ArrayBuffers of each labelmap associated
 *                      with the series displayed on the element.
 *
 * @param  {type} element The cornerstone enabled element.
 * @returns {object[]}    An array of objects containing the labelmapIndex and
 *                        corresponding ArrayBuffer.
 */
function getLabelmapBuffers(element) {
  const { labelmaps3D } = getLabelmaps3D(element);

  if (!labelmaps3D) {
    return [];
  }

  const labelmapBuffers = [];

  for (let i = 0; i < labelmaps3D.length; i++) {
    if (labelmaps3D[i]) {
      labelmapBuffers.push({
        labelmapIndex: i,
        bytesPerVoxel: 2,
        buffer: labelmaps3D[i].buffer,
      });
    }
  }

  return labelmapBuffers;
}

/**
 * getAndCacheLabelmap2D - Returns the 3D labelmap and the currentImageIdIndex.
 *                         Allocates memory for the labelmap and sets a 2D view
 *                         for the currentImageIdIndex if it does not yet exist.
 *
 * @param  {HTMLElement} element  The cornerstone enabled element.
 * @returns {object}              The 3D labelmap and the currentImageIdIndex.
 */
function getAndCacheLabelmap2D(element) {
  const cornerstone = external.cornerstone;
  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];

  const enabledElement = cornerstone.getEnabledElement(element);

  const currentImageIdIndex = stackData.currentImageIdIndex;
  const { rows, columns } = enabledElement.image;
  const numberOfFrames = stackData.imageIds.length;
  const firstImageId = stackData.imageIds[0];

  let brushStackState = state.series[firstImageId];

  let activeLabelmapIndex;

  if (brushStackState) {
    activeLabelmapIndex = brushStackState.activeLabelmapIndex;

    if (!brushStackState.labelmaps3D[activeLabelmapIndex]) {
      addLabelmap3D(
        brushStackState,
        activeLabelmapIndex,
        rows * columns * numberOfFrames
      );
    }

    if (
      !brushStackState.labelmaps3D[activeLabelmapIndex].labelmaps2D[
        currentImageIdIndex
      ]
    ) {
      addLabelmap2DView(
        brushStackState,
        activeLabelmapIndex,
        currentImageIdIndex,
        rows,
        columns
      );
    }
  } else {
    activeLabelmapIndex = 0;

    state.series[firstImageId] = {
      activeLabelmapIndex,
      labelmaps3D: [],
    };

    brushStackState = state.series[firstImageId];

    addLabelmap3D(
      brushStackState,
      activeLabelmapIndex,
      rows * columns * numberOfFrames
    );

    addLabelmap2DView(
      brushStackState,
      activeLabelmapIndex,
      currentImageIdIndex,
      rows,
      columns
    );
  }

  return {
    labelmap3D: brushStackState.labelmaps3D[activeLabelmapIndex],
    currentImageIdIndex,
  };
}

/**
 * addLabelmap3D - Adds a 3D labelmap to the brushStackState.
 *
 * @param  {object} brushStackState The labelmap state for a particular stack.
 * @param  {number} labelmapIndex   The labelmapIndex to set.
 * @param  {number} size            The size of the ArrayBuffer in bytes.
 * @returns {null}
 */
function addLabelmap3D(brushStackState, labelmapIndex, size) {
  // Buffer size is multiplied by 2 as we are using 2 bytes/voxel for 65536 segments.
  brushStackState.labelmaps3D[labelmapIndex] = {
    buffer: new ArrayBuffer(size * 2),
    labelmaps2D: [],
    metadata: {},
    activeDrawColorId: 1,
    imageBitmapCache: null,
  };
}

function getMetadata(elementOrFirstImageId, labelmapIndex = 0, segmentIndex) {
  let firstImageId;

  if (elementOrFirstImageId instanceof HTMLElement) {
    const cornerstone = external.cornerstone;
    const stackState = getToolState(elementOrFirstImageId, 'stack');
    const stackData = stackState.data[0];

    firstImageId = stackData.imageIds[0];
  } else {
    firstImageId = elementOrFirstImageId;
  }

  const brushStackState = state.series[firstImageId];

  if (!(brushStackState && brushStackState.labelmaps3D[labelmapIndex])) {
    logger.warn(`No labelmap3D of labelmap index ${labelmapIndex} on stack.`);
    return;
  }

  const labelmap3D = brushStackState.labelmaps3D[labelmapIndex];

  if (segmentIndex === undefined) {
    return labelmap3D.metadata;
  }

  return labelmap3D.metadata[segmentIndex];
}

function setMetadata(
  elementOrFirstImageId,
  labelmapIndex = 0,
  segmentIndex,
  metadata
) {
  let firstImageId;

  if (elementOrFirstImageId instanceof HTMLElement) {
    const cornerstone = external.cornerstone;
    const stackState = getToolState(elementOrFirstImageId, 'stack');
    const stackData = stackState.data[0];

    firstImageId = stackData.imageIds[0];
  } else {
    firstImageId = elementOrFirstImageId;
  }

  let brushStackState = state.series[firstImageId];

  if (!(brushStackState && brushStackState.labelmaps3D[labelmapIndex])) {
    logger.warn('No 3D labelmap on element.');
    return;
  }

  const labelmap3D = brushStackState.labelmaps3D[labelmapIndex];

  labelmap3D.metadata[segmentIndex] = metadata;
}

/**
 * addLabelmap2DView - Adds a 2D view of one slice of a 3D labelmap.
 *
 * @param  {object} brushStackState     The labelmap state for a particular stack.
 * @param  {number} labelmapIndex       The labelmap index.
 * @param  {number} currentImageIdIndex The stack position of the current image.
 * @param  {number} rows                The number of rows in the image.
 * @param  {number} columns             The number of columns in the image.
 * @returns {null}
 */
function addLabelmap2DView(
  brushStackState,
  labelmapIndex,
  currentImageIdIndex,
  rows,
  columns
) {
  // sliceLengthInBytes is multiplied by 2 as we are using 2 bytes/voxel for 65536 segments.
  const sliceLengthInBytes = rows * columns * 2;

  brushStackState.labelmaps3D[labelmapIndex].labelmaps2D[
    currentImageIdIndex
  ] = {
    pixelData: new Uint16Array(
      brushStackState.labelmaps3D[labelmapIndex].buffer,
      currentImageIdIndex * sliceLengthInBytes,
      sliceLengthInBytes
    ),
    segments: {},
    invalidated: true,
  };
  // Clear cache for this displaySet to avoid flickering.
  brushStackState.labelmaps3D[labelmapIndex].imageBitmapCache = null;
}

/**
 * Sets the brush radius, account for global min/max radius
 *
 * @param {number} radius
 * @returns {void}
 */
function setRadius(radius) {
  state.radius = Math.min(Math.max(radius, state.minRadius), state.maxRadius);
}

/**
 * OnRegisterCallback - Initialise the module when a new element is added.
 * @public
 * @returns {void}
 */
function onRegisterCallback() {
  initColorMap(0);
}

export default {
  state,
  onRegisterCallback,
  getters: {
    metadata: getMetadata,
    labelmapStats: getLabelmapStats,
    getAndCacheLabelmap2D: getAndCacheLabelmap2D,
    labelmaps3D: getLabelmaps3D,
    brushColor: getBrushColor,
    labelmapBuffers: getLabelmapBuffers,
  },
  setters: {
    metadata: setMetadata,
    incrementBrushColor: element => {
      _changeBrushColor(element, 'increase');
    },
    decrementBrushColor: element => {
      _changeBrushColor(element, 'decrease');
    },
    activeLabelmap: setActiveLabelmap,
  },
};

const segmentsPerLabelmap = 255;

/**
 * initColorMap - description
 *
 * @param  {type} labelmapIndex description
 * @returns {type}               description
 */
function initColorMap(labelmapIndex) {
  const colorMapId = `${state.colorMapId}_${labelmapIndex}`;
  const colormap = external.cornerstone.colors.getColormap(colorMapId);

  colormap.setNumberOfColors(segmentsPerLabelmap);

  const newColormap = getNewBrushColorMap(segmentsPerLabelmap);

  for (let i = 0; i < segmentsPerLabelmap; i++) {
    colormap.setColor(i, newColormap[i]);
  }

  state.colorLutTables[colorMapId] = newColormap;
}
