/**
 * Exports an image of the canvas.
 * @export @public @method
 * @name saveAs
 *
 * @param {HTMLElement} element The element to export.
 * @param {string} filename The name of the exported image.
 * @param {string} [mimetype = 'image/png'] The mimetype of the exported image.
 * @returns {void}
 */
export default (element, filename, mimetype = 'image/png') => {
  const canvas = element.querySelector('canvas');

  // If we are using IE, use canvas.msToBlob
  if (canvas.msToBlob) {
    const blob = canvas.msToBlob();

    return window.navigator.msSaveBlob(blob, filename);
  }

  // Thanks to Ken Fyrstenber
  // http://stackoverflow.com/questions/18480474/how-to-save-an-image-from-canvas
  const lnk = document.createElement('a');

  // The key here is to set the download attribute of the a tag
  lnk.download = filename;

  // Convert canvas content to data-uri for link. When download
  // Attribute is set the content pointed to by link will be
  // Pushed as 'download' in HTML5 capable browsers
  lnk.href = canvas.toDataURL(mimetype, 1);

  // Create a 'fake' click-event to trigger the download
  if (document.createEvent) {
    const e = document.createEvent('MouseEvents');

    e.initMouseEvent(
      'click',
      true,
      true,
      window,
      0,
      0,
      0,
      0,
      0,
      false,
      false,
      false,
      false,
      0,
      null
    );

    lnk.dispatchEvent(e);
  } else if (lnk.fireEvent) {
    lnk.fireEvent('onclick');
  }
};
