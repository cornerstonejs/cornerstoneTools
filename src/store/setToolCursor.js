import { state } from './index.js';

/**
 * Creates an SVG Cursor for the target element
 *
 * @param {Object} tool The tool to fetch the cursor from.
 */
export function setSVGCursor (tool, element) {
  //clearSVGCursor(element);
  console.log('attempting to set cursor...');
  // TODO: (state vs options) Exit if cursors wasn't updated
  // TODO: Exit if invalid options to create cursor

  // Note: Max size of an SVG cursor is 128x128, default is 32x32.
  const cursorBlob = tool.svgCursor;
  const mousePoint = cursorBlob.mousePoint ? cursorBlob.mousePoint : '4 4';

  console.log(cursorBlob);

  const svgCursorUrl = window.URL.createObjectURL(cursorBlob);

  console.log(svgCursorUrl);

  console.log(element.style.cursor);
  element.style.cursor = `url('${svgCursorUrl}') ${mousePoint}, auto`;

  state.svgCursorUrl = svgCursorUrl;

  console.log('cursor set?');
  console.log(element.style.cursor);
}


export function resetCursor (element) {
  _clearStateAndSetCursor(element, 'initial')
}

export function hideCursor (element) {
  _clearStateAndSetCursor(element, 'none')
}


function _clearStateAndSetCursor(element, cursorSeting) {
  if (state.svgCursorUrl) {
    window.URL.revokeObjectURL(state.svgCursorUrl);
  }

  state.svgCursorUrl = null;
  element.style.cursor = cursorSeting;
}
