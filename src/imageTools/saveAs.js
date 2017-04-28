export default function (element, filename) {
  const canvas = $(element).find('canvas').get(0);

    // Thanks to Ken Fyrstenber
    // http://stackoverflow.com/questions/18480474/how-to-save-an-image-from-canvas
  const lnk = document.createElement('a');

    // / the key here is to set the download attribute of the a tag
  lnk.download = filename;

    // / convert canvas content to data-uri for link. When download
    // / attribute is set the content pointed to by link will be
    // / pushed as 'download' in HTML5 capable browsers
  lnk.href = canvas.toDataURL();

    // / create a 'fake' click-event to trigger the download
  if (document.createEvent) {

    const e = document.createEvent('MouseEvents');

    e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

    lnk.dispatchEvent(e);

  } else if (lnk.fireEvent) {

    lnk.fireEvent('onclick');
  }
}
