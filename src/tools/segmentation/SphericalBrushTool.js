import external from './../../externalModules.js';
import BrushTool from './BrushTool.js';
import store from './../../store/index.js';
import brushUtils from './../../util/segmentation/brush/index.js';
import EVENTS from '../../events.js';
import { getToolState } from '../../stateManagement/toolState.js';
import { getLogger } from '../../util/logger.js';

const logger = getLogger('tools:SphericalBrushTool');

const { drawBrushPixels, getCircle } = brushUtils;

const { getters, setters, configuration } = store.modules.segmentation;

/**
 * @public
 * @class BrushTool
 * @memberof Tools.Brush
 * @classdesc Tool for drawing segmentations on an image.
 * @extends Tools.Base.BaseBrushTool
 */
export default class SphericalBrushTool extends BrushTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'SphericalBrush',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: { alwaysEraseOnClick: false },
    };

    super(defaultProps);

    this.touchDragCallback = this._paint.bind(this);
  }

  /**
   * Paints the data to the canvas.
   *
   * @private
   * @param  {Object} evt The data object associated with the event.
   * @returns {void}
   */
  _paint(evt) {
    const { cornerstone, cornerstoneMath } = external;
    const eventData = evt.detail;
    const element = eventData.element;
    const image = eventData.image;
    const { rows, columns } = image;
    const { x, y } = eventData.currentPoints.image;
    const radius = configuration.radius;

    const pixelSpacing = Math.max(
      image.rowPixelSpacing,
      image.columnPixelSpacing
    );

    if (x < 0 || x > columns || y < 0 || y > rows) {
      return;
    }

    const imagePlaneOfCurrentImage = cornerstone.metaData.get(
      'imagePlaneModule',
      image.imageId
    );

    const stackState = getToolState(element, 'stack');
    const stackData = stackState.data[0];
    const { imageIds, currentImageIdIndex } = stackData;

    let imagesInRange;

    if (imagePlaneOfCurrentImage) {
      const ippOfCurrentImage = imagePlaneOfCurrentImage.imagePositionPatient;

      imagesInRange = this._getImagesInRange(
        currentImageIdIndex,
        ippOfCurrentImage,
        imageIds,
        radius,
        pixelSpacing
      );
    } else {
      logger.warn(
        `No imagePlane metadata found for image, defaulting to circle brush application.`
      );

      imagesInRange = [
        // The current image.
        {
          imageIdIndex: currentImageIdIndex,
          radiusOnImage: radius,
        },
      ];
    }

    this._imagesInRange = imagesInRange;

    const { labelmap3D, activeLabelmapIndex } = getters.getAndCacheLabelmap2D(
      element
    );

    const shouldErase =
      this._isCtrlDown(eventData) || this.configuration.alwaysEraseOnClick;

    for (let i = 0; i < imagesInRange.length; i++) {
      const { imageIdIndex, radiusOnImage } = imagesInRange[i];
      const pointerArray = getCircle(radiusOnImage, rows, columns, x, y);

      // Cache the view on this image if its not present.
      setters.cacheLabelMap2DView(labelmap3D, imageIdIndex, rows, columns);

      // Draw / Erase the active color.
      drawBrushPixels(
        pointerArray,
        labelmap3D,
        imageIdIndex,
        columns,
        shouldErase
      );
    }

    external.cornerstone.triggerEvent(element, EVENTS.LABELMAP_MODIFIED, {
      activeLabelmapIndex,
    });

    external.cornerstone.updateImage(evt.detail.element);
  }

  /**
   * _getImagesInRange - Returns an array of image Ids within range of the
   * sphere, and the in-plane brush radii of those images.
   *
   * @param  {string} currentImageIdIndex The imageId of the image displayed on
   *                                   the cornerstone enabled element.
   * @param  {number[]} ippOfCurrentImage   The image position patient of the image.
   * @param  {string[]} imageIds           An array of images in the stack.
   * @param  {number} radius             The radius of the sphere.
   * @param  {number} pixelSpacing       The pixelSpacing.
   * @returns {Object[]}                   An array of imageIds in range and their
   *                                   in plane brush radii.
   */
  _getImagesInRange(
    currentImageIdIndex,
    ippOfCurrentImage,
    imageIds,
    radius,
    pixelSpacing
  ) {
    const radiusInMM = radius * pixelSpacing;
    const imagesInRange = [
      // The current image.
      {
        imageIdIndex: currentImageIdIndex,
        radiusOnImage: radius,
      },
    ];

    // Check images above
    for (let i = currentImageIdIndex + 1; i < imageIds.length; i++) {
      const radiusOnImage = this._getRadiusOnImage(
        imageIds[i],
        ippOfCurrentImage,
        radiusInMM,
        pixelSpacing
      );

      if (!radiusOnImage) {
        break;
      }

      imagesInRange.push({
        imageIdIndex: i,
        radiusOnImage,
      });
    }

    // Check images below
    for (let i = currentImageIdIndex - 1; i >= 0; i--) {
      const radiusOnImage = this._getRadiusOnImage(
        imageIds[i],
        ippOfCurrentImage,
        radiusInMM,
        pixelSpacing
      );

      if (!radiusOnImage) {
        break;
      }

      imagesInRange.push({
        imageIdIndex: i,
        radiusOnImage,
      });
    }

    return imagesInRange;
  }

  /**
   * _getRadiusOnImage - If the image is in range of the spherical brush, returns
   *                     the in-plane brush radius on that image.
   *
   * @param  {string} imageId           The cornerstone imageId of the image.
   * @param  {number[]} ippOfCurrentImage The image position patient of the current image.
   * @param  {number} radiusInMM        The radius of the sphere in millimeters.
   * @param  {string} pixelSpacing      The pixelspacing.
   * @returns {number|undefined}        The brush radius on the image, undefined if
   *                                    the image is out of range of the sphere.
   */
  _getRadiusOnImage(imageId, ippOfCurrentImage, radiusInMM, pixelSpacing) {
    const imagePlane = external.cornerstone.metaData.get(
      'imagePlaneModule',
      imageId
    );

    if (!imagePlane) {
      logger.warn(
        `Can't find imagePlane metadata for image, cancelling spherical brushing on: ${imageId},`
      );

      return;
    }

    const ipp = imagePlane.imagePositionPatient;

    const distance = Math.sqrt(
      Math.pow(ipp[0] - ippOfCurrentImage[0], 2) +
        Math.pow(ipp[1] - ippOfCurrentImage[1], 2) +
        Math.pow(ipp[2] - ippOfCurrentImage[2], 2)
    );

    if (distance > radiusInMM) {
      // Image too far away, break!
      return;
    }

    return Math.floor(
      Math.sqrt(Math.pow(radiusInMM, 2) - Math.pow(distance, 2)) / pixelSpacing
    );
  }

  _endPainting(evt) {
    const { labelmap3D, shouldErase } = this.paintEventData;

    const imagesInRange = this._imagesInRange;

    for (let i = 0; i < imagesInRange.length; i++) {
      const { imageIdIndex } = imagesInRange[i];
      const labelmap2D = labelmap3D.labelmaps2D[imageIdIndex];

      // Grab the labels on the slice.
      const segmentSet = new Set(labelmap2D.pixelData);
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

      logger.warn(segmentsOnLabelmap);

      labelmap2D.segmentsOnLabelmap = segmentsOnLabelmap;

      // If labelmap2D now empty, delete it.
      if (
        shouldErase &&
        labelmap2D.segmentsOnLabelmap.length === 1 &&
        labelmap2D.segmentsOnLabelmap[0] === 0
      ) {
        delete labelmap3D.labelmaps2D[imageIdIndex];
      }
    }
  }
}
