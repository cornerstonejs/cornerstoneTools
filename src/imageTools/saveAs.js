export default function saveAs (element, filename, mimetype = 'image/png') {
  // Setting the default value for mimetype to image/png
  const canvas = element.querySelector('canvas');

  // Thanks to Ken Fyrstenber
  // http://stackoverflow.com/questions/18480474/how-to-save-an-image-from-canvas
  const lnk = document.createElement('a');

  // The key here is to set the download attribute of the a tag
  lnk.download = filename;

  // Convert canvas content to data-uri for link. When download
  // Attribute is set the content pointed to by link will be
  // Pushed as 'download' in HTML5 capable browsers
  lnk.href = canvas.toDataURL(mimetype, 1);

  // / create a 'fake' click-event to trigger the download
  if (document.createEvent) {
    const e = document.createEvent('MouseEvents');

    e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

    lnk.dispatchEvent(e);
  } else if (lnk.fireEvent) {
    lnk.fireEvent('onclick');
  }
}
