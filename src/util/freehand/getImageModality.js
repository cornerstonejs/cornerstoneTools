import external from './../../externalModules.js';

// TODO: Move this to a more central location and use it everywhere

/**
 * Gets the modality of the provided image
 * @export @public @method
 * @name getImageModality
 *
 * @param {Object} image The image
 * @returns {String} The modality of the image, or null if none could be determined
 */
function getImageModality(image) {
  const { imageId } = image;

  const seriesModule = external.cornerstone.metaData.get(
    'generalSeriesModule',
    imageId
  );

  if (seriesModule) {
    return seriesModule.modality;
  }

  return null;
}

export default getImageModality;
