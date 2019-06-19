import external from './../../externalModules.js';
import { getToolState } from '../../stateManagement/toolState.js';
import getNewColorLUT from '../../util/brush/getNewColorLUT.js';
import labelmapStats from '../../util/brush/labelmapStats.js';
import EVENTS from '../../events.js';

import { getters as storeGetters } from '../index.js';

import { getLogger } from '../../util/logger.js';

const logger = getLogger('store:modules:brushModule');

const state = {
  colorLutTables: {},
  radius: 10,
  minRadius: 1,
  maxRadius: 50,
  segmentsPerLabelmap: 65535, // Max is 65535 due to using 16-bit Unsigned ints.
  alpha: 0.6,
  alphaOfInactiveLabelmap: 0.2,
  colorMapId: 'BrushColorMap',
  segmentationMetadata: {},
  series: {},
};

/**
 * GetMetadata - Returns the metadata object for a partiular segment if
 * segmentIndex is specified, otherwise returns an array of all segment metadata
 * for the labelmap.
 *
 * @param  {HTMLElement} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @param  {number} [labelmapIndex]    If undefined, defaults to the active
 *                                     labelmap index.
 * @param  {number} [segmentIndex]     The segment index.
 * @returns {Object|Object[]}          A metadata object or an array of
 *                                     metadata objects.
 */
function getMetadata(elementOrEnabledElementUID, labelmapIndex, segmentIndex) {
  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];
  const firstImageId = stackData.imageIds[0];

  const brushStackState = state.series[firstImageId];

  if (!brushStackState) {
    logger.warn(`brushStackState is undefined`);

    return;
  }

  if (labelmapIndex === undefined) {
    labelmapIndex = brushStackState.activeLabelmapIndex;
  }

  logger.warn(`getMetadata, labelmapIndex: ${labelmapIndex}`);

  if (!brushStackState.labelmaps3D[labelmapIndex]) {
    logger.warn(`No labelmap3D of labelmap index ${labelmapIndex} on stack.`);

    return;
  }

  const labelmap3D = brushStackState.labelmaps3D[labelmapIndex];

  if (segmentIndex === undefined) {
    return labelmap3D.metadata;
  }

  return labelmap3D.metadata[segmentIndex];
}

/**
 * GetLabelmaps3D - Returns the labelmaps associated with the series displayed
 * in the element, the activeLabelmapIndex and the currentImageIdIndex.
 *
 * @param  {HTMLElement} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @returns {Object}              An object containing the 3D labelmaps,
 *                                the activeLabelmapIndex amd the currentImageIdIndex.
 */
function getLabelmaps3D(elementOrEnabledElementUID) {
  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

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
 * GetAndCacheLabelmap2D - Returns the 3D labelmap and the currentImageIdIndex.
 *                         Allocates memory for the labelmap and sets a 2D view
 *                         for the currentImageIdIndex if it does not yet exist.
 *
 * @param  {HTMLElement} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @returns {Object}              The 3D labelmap and the currentImageIdIndex.
 */
function getAndCacheLabelmap2D(elementOrEnabledElementUID) {
  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

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
      _addLabelmap3D(
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
      _addLabelmap2DView(
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

    _addLabelmap3D(
      brushStackState,
      activeLabelmapIndex,
      rows * columns * numberOfFrames
    );

    _addLabelmap2DView(
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
    activeLabelmapIndex,
  };
}

/**
 * GetLabelmapStats - returns the maximum pixel value, mean and standard
 * deviation of the segment given by the segmentIndex of the scan on the element.
 *
 * @param  {HTMLElement} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @param  {number} segmentIndex  The segment index to query.
 * @returns {Object}              An object containing the maximum pixel value,
 *                                the mean and the standard deviation.
 */
function getLabelmapStats(elementOrEnabledElementUID, segmentIndex) {
  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  return new Promise(resolve => {
    const cornerstone = external.cornerstone;
    const stackState = getToolState(element, 'stack');
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
 * GetBrushColor - Returns the brush color as a string for the active segment of
 * the active labelmap for the series displayed on the element.
 *
 * @param  {HTMLElement} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @param  {boolean} drawing = false    Whether the user is drawing or not.
 * @returns {string}                    An rgba value as a string.
 */
function getBrushColor(elementOrEnabledElementUID, drawing = false) {
  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];
  const firstImageId = stackData.imageIds[0];

  const brushStackState = state.series[firstImageId];

  let color;

  if (brushStackState) {
    const activeLabelmapIndex = brushStackState.activeLabelmapIndex;
    const labelmap3D = brushStackState.labelmaps3D[activeLabelmapIndex];

    if (labelmap3D) {
      const activeSegmentIndex = labelmap3D.activeSegmentIndex;

      color =
        state.colorLutTables[`${state.colorMapId}_${activeLabelmapIndex}`][
          activeSegmentIndex
        ];
    } else {
      // Just set to new labelmap index
    }
  } else {
    // No data yet, make brush the default color of colormap 0.
    color = state.colorLutTables[`${state.colorMapId}_0`][1];
  }

  return drawing
    ? `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1.0 )`
    : `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.8 )`;
}

/**
 * GetActiveSegmentIndex - Returns the active segment segment index  for the
 * active labelmap for the series displayed on the element.
 *
 * @param  {HTMLElement} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @param  {number} [labelmapIndex] The labelmap index, defaults to the active labelmap index.
 * @returns {number}                                  The active segment index.
 */
function getActiveSegmentIndex(elementOrEnabledElementUID, labelmapIndex) {
  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];
  const firstImageId = stackData.imageIds[0];

  const brushStackState = state.series[firstImageId];

  if (brushStackState) {
    if (labelmapIndex === undefined) {
      labelmapIndex = brushStackState.activeLabelmapIndex;
    }

    const labelmap3D = brushStackState.labelmaps3D[labelmapIndex];

    if (labelmap3D) {
      return labelmap3D.activeSegmentIndex;
    }
  }

  return 1;
}

/**
 * GetLabelmapBuffers - Returns the ArrayBuffers of each labelmap associated
 *                      with the series displayed on the element, or a specific
 *                      one if labelmapIndex is defined.
 *
 * @param  {HTMLElement} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @param {type} [labelmapIndex] Optional filtering to only return one labelmap.
 * @returns {Object|Object[]} An array of objects containing the labelmapIndex and
 *                        corresponding ArrayBuffer. Only one object if
 *                        labelmapIndex was specified.
 */
function getLabelmapBuffers(elementOrEnabledElementUID, labelmapIndex) {
  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const { labelmaps3D } = getLabelmaps3D(element);

  if (!labelmaps3D) {
    return [];
  }

  if (labelmapIndex !== undefined) {
    if (labelmaps3D[labelmapIndex]) {
      return {
        labelmapIndex,
        bytesPerVoxel: 2,
        buffer: labelmaps3D[labelmapIndex].buffer,
      };
    }

    return;
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
 * GetActiveLabelmapBuffer - Returns the ArrayBuffer corresponding to the active
 *                           labelmap associated with the series displayed on
 *                           the element.
 *
 * @param  {HTMLElement} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @returns {Object}      An object containing the ArrayBuffer.
 */
function getActiveLabelmapBuffer(elementOrEnabledElementUID) {
  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const cornerstone = external.cornerstone;
  const stackState = getToolState(element, 'stack');
  const imageIds = stackState.data[0].imageIds;
  const firstImageId = imageIds[0];

  const brushStackState = state.series[firstImageId];

  if (!brushStackState) {
    return;
  }

  const activeLabelmapIndex = brushStackState.activeLabelmapIndex;

  return getLabelmapBuffers(element, activeLabelmapIndex);
}

/**
 * SetMetadata - Sets the metadata object for a particular segment of a
 * labelmap3D.
 *
 * @param  {HTMLElement} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @param  {number} labelmapIndex = 0 The labelmap index.
 * @param  {number} segmentIndex      The segment index.
 * @param  {Object} metadata          The metadata object to set.
 * @returns {null}
 */
function setMetadata(
  elementOrEnabledElementUID,
  labelmapIndex = 0,
  segmentIndex,
  metadata
) {
  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const cornerstone = external.cornerstone;
  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];
  const firstImageId = stackData.imageIds[0];

  let brushStackState = state.series[firstImageId];

  if (!brushStackState) {
    state.series[firstImageId] = {
      labelmapIndex,
      labelmaps3D: [],
    };

    brushStackState = state.series[firstImageId];
  }

  if (!brushStackState.labelmaps3D[labelmapIndex]) {
    const enabledElement = cornerstone.getEnabledElement(element);

    const { rows, columns } = enabledElement.image;
    const numberOfFrames = stackData.imageIds.length;

    _addLabelmap3D(
      brushStackState,
      labelmapIndex,
      rows * columns * numberOfFrames
    );
  }

  const labelmap3D = brushStackState.labelmaps3D[labelmapIndex];

  labelmap3D.metadata[segmentIndex] = metadata;
}

/**
 * SetLabelmap3DForElement - Takes an 16-bit encoded ArrayBuffer and stores
 * it as a segmentation for the series assoicated with the element.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID The cornerstone
 *                                                  enabled element or its UUID.
 * @param  {ArrayBuffer} buffer
 * @param  {number} labelmapIndex The index to store the labelmap under.
 * @param  {Object[]} metadata = [] Any metadata about the segments.
 * @returns {null}
 */
function setLabelmap3DForElement(
  elementOrEnabledElementUID,
  buffer,
  labelmapIndex,
  metadata = []
) {
  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const stackState = getToolState(element, 'stack');
  const numberOfFrames = stackState.data[0].imageIds.length;
  const firstImageId = stackState.data[0].imageIds[0];

  setLabelmap3DByFirstImageId(
    firstImageId,
    buffer,
    labelmapIndex,
    metadata,
    numberOfFrames
  );

  if (element) {
    external.cornerstone.triggerEvent(element, EVENTS.LABELMAP_MODIFIED, {
      labelmapIndex,
    });
  }
}

/**
 * SetLabelmap3DForElement - Takes an 16-bit encoded ArrayBuffer and stores
 * it as a segmentation for the series assoicated with the firstImageId.
 *
 * @param  {HTMLElement|string} firstImageId  The firstImageId of the series to
 *                                            store the segmentation on.
 * @param  {ArrayBuffer} buffer
 * @param  {number} labelmapIndex The index to store the labelmap under.
 * @param  {Object[]} metadata = [] Any metadata about the segments.
 * @param  {number} numberOfFrames The number of frames, required to set up the
 *                                 relevant labelmap2D views.
 * @returns {null}
 */
function setLabelmap3DByFirstImageId(
  firstImageId,
  buffer,
  labelmapIndex,
  metadata = [],
  numberOfFrames
) {
  let brushStackState = state.series[firstImageId];

  if (!brushStackState) {
    state.series[firstImageId] = {
      labelmapIndex,
      labelmaps3D: [],
    };

    brushStackState = state.series[firstImageId];
  }

  brushStackState.labelmaps3D[labelmapIndex] = {
    buffer,
    labelmaps2D: [],
    metadata,
    activeSegmentIndex: 1,
    imageBitmapCache: null,
  };

  const labelmaps2D = brushStackState.labelmaps3D[labelmapIndex].labelmaps2D;

  const slicelengthInBytes = buffer / numberOfFrames;
  const sliceLengthInUint16 = slicelengthInBytes / 2; // SliceLength in Uint16.

  for (let i = 0; i < numberOfFrames; i++) {
    const pixelData = new Uint16Array(
      buffer,
      slicelengthInBytes * i,
      sliceLengthInUint16
    );

    const segmentsOnLabelmap = _getSegmentsOnPixelData(pixelData);

    if (segmentsOnLabelmap.some(segment => !segment)) {
      labelmaps2D[i] = {
        pixelData,
        segmentsOnLabelmap: [],
        invalidated: true,
      };
    }
  }
}

function _getSegmentsOnPixelData(pixelData) {
  // Grab the labels on the slice.
  const segmentSet = new Set(pixelData);
  const iterator = segmentSet.values();

  const segmentsOnLabelmap = [];
  let done = false;

  while (!done) {
    const next = iterator.next();

    done = next.done;

    if (!done) {
      segmentsOnLabelmap.push(next.value);
    }
  }

  return segmentsOnLabelmap;
}

/**
 * SetDeleteSegment - Deletes the segment and any associated metadata from
 *                    the labelmap.
 *
 * @param  {type} elementOrEnabledElementUID The cornerstone enabled element
 *                                           or its UUID.
 * @param  {type} segmentIndex               The segment Index
 * @param  {type} [labelmapIndex]            The labelmap index. Defaults to the
 *                                           active labelmap index.
 * @returns {null}
 */
function setDeleteSegment(
  elementOrEnabledElementUID,
  segmentIndex,
  labelmapIndex
) {
  if (!segmentIndex) {
    return;
  }

  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];
  const currentImageIdIndex = stackData.currentImageIdIndex;
  const firstImageId = stackData.imageIds[0];

  const brushStackState = state.series[firstImageId];

  if (!brushStackState) {
    return;
  }

  if (labelmapIndex === undefined) {
    labelmapIndex = brushStackState.activeLabelmapIndex;
  }

  const labelmap3D = brushStackState.labelmaps3D[labelmapIndex];

  if (!labelmap3D) {
    return;
  }

  // Delete metadata if present.
  delete labelmap3D.metadata[segmentIndex];

  const labelmaps2D = labelmap3D.labelmaps2D;

  // Clear segment's voxels.
  for (let i = 0; i < labelmaps2D.length; i++) {
    const labelmap2D = labelmaps2D[i];

    // If the labelmap2D has data, and it contains the segment, delete it.
    if (labelmap2D && labelmap2D.segmentsOnLabelmap.includes(segmentIndex)) {
      const pixelData = labelmap2D.pixelData;

      // Remove this segment from the list.
      const indexOfSegment = labelmap2D.segmentsOnLabelmap.indexOf(
        segmentIndex
      );

      labelmap2D.segmentsOnLabelmap.splice(indexOfSegment, 1);
      labelmap2D.invalidated = true;

      // Delete the label for this segment.
      for (let p = 0; p < pixelData.length; p++) {
        if (pixelData[p] === segmentIndex) {
          pixelData[p] = 0;
        }
      }
    }
  }

  external.cornerstone.updateImage(element);
}

/**
 * GetActiveLabelmapIndex - description
 *
 * @param  {type} elementOrEnabledElementUID description
 * @returns {type}                            description
 */
function getActiveLabelmapIndex(elementOrEnabledElementUID) {
  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];
  const firstImageId = stackData.imageIds[0];

  const brushStackState = state.series[firstImageId];

  if (!brushStackState) {
    return;
  }

  return brushStackState.activeLabelmapIndex;
}

/**
 * GetActiveCornerstoneColorMap - Returns the cornerstone colormap for the active
 * labelmap.
 *
 * @param  {type} elementOrEnabledElementUID The cornerstone enabled
 *                                           element or its UUID.
 * @returns {Object}                         The cornerstone colormap.
 */
function getActiveCornerstoneColorMap(elementOrEnabledElementUID) {
  const activeLabelmapIndex = getActiveLabelmapIndex(
    elementOrEnabledElementUID
  );

  const colorMapId = `${state.colorMapId}_${activeLabelmapIndex}`;

  return external.cornerstone.colors.getColormap(colorMapId);
}

/**
 * SetActiveLabelmap - Sets the active labelmap for the stack displayed on this
 * elemenet to the labelmap given by the labelmapIndex. Creates the labelmap if
 * it doesn't exist.
 *
 * @param  {HTMLElement} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @param  {number} labelmapIndex = 0 The index of the labelmap.
 * @returns {null}
 */
function setActiveLabelmap(elementOrEnabledElementUID, labelmapIndex = 0) {
  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const cornerstone = external.cornerstone;
  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];
  const enabledElement = cornerstone.getEnabledElement(element);
  const { rows, columns } = enabledElement.image;
  const numberOfFrames = stackData.imageIds.length;
  const firstImageId = stackData.imageIds[0];

  let brushStackState = state.series[firstImageId];

  if (!state.colorLutTables[`${state.colorMapId}_${labelmapIndex}`]) {
    setColorLUT(labelmapIndex);
  }

  if (brushStackState) {
    brushStackState.activeLabelmapIndex = labelmapIndex;

    if (!brushStackState.labelmaps3D[labelmapIndex]) {
      _addLabelmap3D(
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

    _addLabelmap3D(
      brushStackState,
      labelmapIndex,
      rows * columns * numberOfFrames
    );
  }

  cornerstone.updateImage(element);
}

/**
 * SetIncrementActiveSegmentIndex - Increment the active segment index for the
 *                                  active labelmap on the element.
 *
 * @param  {HTMLElement} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @returns {null}
 */
function setIncrementActiveSegmentIndex(elementOrEnabledElementUID) {
  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  _changeActiveSegmentIndex(element, 'increase');
}

/**
 * SetDecrementActiveSegmentIndex - Decrement the active segment index for the
 *                                  active labelmap on the element.
 *
 * @param  {HTMLElement} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @returns {null}
 */
function setDecrementActiveSegmentIndex(elementOrEnabledElementUID) {
  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  _changeActiveSegmentIndex(element, 'decrease');
}

/**
 * SetActiveSegmentIndex - Sets the active segment index for the active labelmap
 *                         on the element.
 *
 * @param  {HTMLElement} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @param {number}  segmentIndex The index to set the brush to.
 * @returns {null}
 */
function setActiveSegmentIndex(elementOrEnabledElementUID, segmentIndex) {
  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];
  const firstImageId = stackData.imageIds[0];

  const brushStackState = state.series[firstImageId];

  if (!brushStackState) {
    return;
  }

  const activeLabelmapIndex = brushStackState.activeLabelmapIndex;
  const labelmap3D = brushStackState.labelmaps3D[activeLabelmapIndex];

  if (segmentIndex <= 0) {
    segmentIndex = 1;
  } else if (segmentIndex > state.segmentsPerLabelmap) {
    segmentIndex = state.segmentsPerLabelmap;
  }

  labelmap3D.activeSegmentIndex = segmentIndex;
}

/**
 * Invalidate all the brush data for a labelmap. Useful if multiple libraries
 * are writting to the same labelmap.
 *
 * @param {string} elementOrEnabledElementUID - The cornerstone enabled element
 * or the enabledElement UID This identifier for the enabled element.
 * @param {number} labelmapIndex - The labelmap index.
 * @returns {null}
 */
function invalidateBrushOnEnabledElement(
  elementOrEnabledElementUID,
  labelmapIndex = 0
) {
  const element = _getEnabledElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const { labelmaps3D } = getLabelmaps3D(element);

  const labelmap3D = labelmaps3D[labelmapIndex];

  if (!labelmap3D) {
    return;
  }

  labelmap3D.labelmaps2D.forEach(l => {
    l.invalidated = true;
  });

  external.cornerstone.updateImage(element, true);
}

/**
 * _getEnabledElement - Returns the enabledElement given either the enabledElement
 *                      or its UUID.
 *
 * @param  {string|HTMLElement} elementOrEnabledElementUID  The enabledElement
 *                                                          or its UUID.
 * @returns {HTMLElement}
 */
function _getEnabledElement(elementOrEnabledElementUID) {
  if (elementOrEnabledElementUID instanceof HTMLElement) {
    return elementOrEnabledElementUID;
  }

  return storeGetters.enabledElementByUID(elementOrEnabledElementUID);
}

/**
 * SetColorLUT - Sets the labelmap to a specfic LUT, or generates a new LUT.
 *
 * @param  {type} labelmapIndex The labelmap index to apply the color LUT to.
 * @param  {type} [colorLUT]    An array of The colorLUT to set.
 * @returns {type}               description
 */
function setColorLUT(labelmapIndex, colorLUT) {
  const colorMapId = `${state.colorMapId}_${labelmapIndex}`;
  const colormap = external.cornerstone.colors.getColormap(colorMapId);
  const segmentsPerLabelmap = state.segmentsPerLabelmap;

  if (!_validColorLUTLength(colorLUT, segmentsPerLabelmap)) {
    return;
  }

  if (colorLUT && colorLUT.length !== segmentsPerLabelmap) {
    logger.warn('The labelmap being set is not the same');
  }

  colormap.setNumberOfColors(segmentsPerLabelmap + 1);

  colorLUT = colorLUT || getNewColorLUT(segmentsPerLabelmap);

  // Apppend the "zero" (no label) color to the front of the LUT.
  colorLUT = [[0, 0, 0, 0], ...colorLUT];

  for (let i = 0; i <= segmentsPerLabelmap; i++) {
    colormap.setColor(i, colorLUT[i]);
  }

  state.colorLutTables[colorMapId] = colorLUT;
}

function _validColorLUTLength(colorLUT, segmentsPerLabelmap) {
  if (colorLUT) {
    if (colorLUT.length < segmentsPerLabelmap) {
      logger.error(
        `The provided colorLUT only provides ${colorLUT.length} labels, whereas segmentsPerLabelmap is set to ${segmentsPerLabelmap}.`
      );

      return false;
    } else if (colorLUT.length > segmentsPerLabelmap) {
      logger.warn(
        `segmentsPerLabelmap is set to ${segmentsPerLabelmap}, and the provided colorLUT provides ${colorLUT.length}. Using the first ${segmentsPerLabelmap} colors from the LUT.`
      );
    }
  }

  return true;
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
 * OnRegisterCallback - Initialise the most basic colormap when cornerstone
 * is initialised.
 *
 * @returns {void}
 */
function onRegisterCallback() {
  setColorLUT(0);
}

export default {
  state,
  onRegisterCallback,
  getters: {
    metadata: getMetadata,
    labelmaps3D: getLabelmaps3D,
    activeLabelmapIndex: getActiveLabelmapIndex,
    activeSegmentIndex: getActiveSegmentIndex,
    getAndCacheLabelmap2D,
    labelmapStats: getLabelmapStats,
    brushColor: getBrushColor,
    activeCornerstoneColorMap: getActiveCornerstoneColorMap,
    labelmapBuffers: getLabelmapBuffers,
    activeLabelmapBuffer: getActiveLabelmapBuffer,
  },
  setters: {
    metadata: setMetadata,
    labelmap3DForElement: setLabelmap3DForElement,
    labelmap3DByFirstImageId: setLabelmap3DByFirstImageId,
    incrementActiveSegmentIndex: setIncrementActiveSegmentIndex,
    decrementActiveSegmentIndex: setDecrementActiveSegmentIndex,
    activeSegmentIndex: setActiveSegmentIndex,
    deleteSegment: setDeleteSegment,
    colorLUT: setColorLUT,
    activeLabelmap: setActiveLabelmap,
    radius: setRadius,
    invalidateBrushOnEnabledElement,
  },
};

/**
 * _changeActiveSegmentIndex - Changes the active segment index for the active
 *                             labelmap on the element.
 *
 * @param  {HTMLElement} element           The cornerstone enabled element.
 * @param  {boolean} increaseOrDecrease = 'increase' Whether to increase/decrease
 *                                                the activeLabelmapIndex.
 * @returns {null}
 */
function _changeActiveSegmentIndex(element, increaseOrDecrease = 'increase') {
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
      labelmap3D.activeSegmentIndex++;

      if (labelmap3D.activeSegmentIndex > state.segmentsPerLabelmap) {
        labelmap3D.activeSegmentIndex = 1;
      }
      break;
    case 'decrease':
      labelmap3D.activeSegmentIndex--;

      if (labelmap3D.activeSegmentIndex <= 0) {
        labelmap3D.activeSegmentIndex = state.segmentsPerLabelmap;
      }
      break;
  }
}

/**
 * _addLabelmap3D - Adds a 3D labelmap to the brushStackState.
 *
 * @param  {Object} brushStackState The labelmap state for a particular stack.
 * @param  {number} labelmapIndex   The labelmapIndex to set.
 * @param  {number} size            The size of the ArrayBuffer in bytes.
 * @returns {null}
 */
function _addLabelmap3D(brushStackState, labelmapIndex, size) {
  // Buffer size is multiplied by 2 as we are using 2 bytes/voxel for 65536 segments.
  brushStackState.labelmaps3D[labelmapIndex] = {
    buffer: new ArrayBuffer(size * 2),
    labelmaps2D: [],
    metadata: [],
    activeSegmentIndex: 1,
    imageBitmapCache: null,
  };
}

/**
 * _addLabelmap2DView - Adds a 2D view of one slice of a 3D labelmap.
 *
 * @param  {Object} brushStackState     The labelmap state for a particular stack.
 * @param  {number} labelmapIndex       The labelmap index.
 * @param  {number} currentImageIdIndex The stack position of the current image.
 * @param  {number} rows                The number of rows in the image.
 * @param  {number} columns             The number of columns in the image.
 * @returns {null}
 */
function _addLabelmap2DView(
  brushStackState,
  labelmapIndex,
  currentImageIdIndex,
  rows,
  columns
) {
  const sliceLength = rows * columns;
  const byteOffset = sliceLength * 2 * currentImageIdIndex; // 2 bytes/pixel

  const pixelData = new Uint16Array(
    brushStackState.labelmaps3D[labelmapIndex].buffer,
    byteOffset,
    sliceLength
  );

  brushStackState.labelmaps3D[labelmapIndex].labelmaps2D[
    currentImageIdIndex
  ] = {
    pixelData,
    segmentsOnLabelmap: [],
    invalidated: true,
  };
  // Clear cache for this displaySet to avoid flickering.
  brushStackState.labelmaps3D[labelmapIndex].imageBitmapCache = null;
}
