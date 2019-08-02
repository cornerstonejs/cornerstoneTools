import numbersWithCommas from '../../util/numbersWithCommas.js';
import getImageModality from './getImageModality';

/**
 * Gets the text box for an image and its data
 * @export @public @method
 * @name getTextBoxText
 *
 * @param {Object} image The image
 * @param {Object} data The data
 * @returns {String[]} The text content for the text box
 */
function getTextBoxText(image, data) {
  const modality = getImageModality(image);
  const { meanStdDev, meanStdDevSUV, area } = data;
  // Define an array to store the rows of text for the textbox
  const textLines = [];

  // If the mean and standard deviation values are present, display them
  if (meanStdDev && meanStdDev.mean !== undefined) {
    // If the modality is CT, add HU to denote Hounsfield Units
    let moSuffix = '';

    if (modality === 'CT') {
      moSuffix = ' HU';
    }

    // Create a line of text to display the mean and any units that were specified (i.e. HU)
    let meanText = `Mean: ${numbersWithCommas(
      meanStdDev.mean.toFixed(2)
    )}${moSuffix}`;
    // Create a line of text to display the standard deviation and any units that were specified (i.e. HU)
    let stdDevText = `StdDev: ${numbersWithCommas(
      meanStdDev.stdDev.toFixed(2)
    )}${moSuffix}`;

    // If this image has SUV values to display, concatenate them to the text line
    if (meanStdDevSUV && meanStdDevSUV.mean !== undefined) {
      const SUVtext = ' SUV: ';

      meanText += SUVtext + numbersWithCommas(meanStdDevSUV.mean.toFixed(2));
      stdDevText +=
        SUVtext + numbersWithCommas(meanStdDevSUV.stdDev.toFixed(2));
    }

    // Add these text lines to the array to be displayed in the textbox
    textLines.push(meanText);
    textLines.push(stdDevText);
  }

  // If the area is a sane value, display it
  if (area) {
    // Determine the area suffix based on the pixel spacing in the image.
    // If pixel spacing is present, use millimeters. Otherwise, use pixels.
    // This uses Char code 178 for a superscript 2
    let suffix = ` mm${String.fromCharCode(178)}`;

    if (!image.rowPixelSpacing || !image.columnPixelSpacing) {
      suffix = ` pixels${String.fromCharCode(178)}`;
    }

    // Create a line of text to display the area and its units
    const areaText = `Area: ${numbersWithCommas(area.toFixed(2))}${suffix}`;

    // Add this text line to the array to be displayed in the textbox
    textLines.push(areaText);
  }

  return textLines;
}

export default getTextBoxText;
