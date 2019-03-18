import { state } from './index.js';

export { setToolCursor, resetToolCursor, hideToolCursor };

/**
 * Creates an SVG Cursor for the target element
 *
 * @param {MouseCursor} svgCursor - The cursor.
 */
function setToolCursor(element, svgCursor) {
  console.log('attempting to set cursor...');
  // TODO: (state vs options) Exit if cursors wasn't updated
  // TODO: Exit if invalid options to create cursor

  // Note: Max size of an SVG cursor is 128x128, default is 32x32.
  const cursorBlob = svgCursor.blob;
  const mousePoint = svgCursor.mousePoint;

  const svgCursorUrl = window.URL.createObjectURL(cursorBlob);
  element.style.cursor = `url('${svgCursorUrl}') ${mousePoint}, auto`;

  state.svgCursorUrl = svgCursorUrl;
}

function resetToolCursor(element) {
  _clearStateAndSetCursor(element, 'initial');
}

function hideToolCursor(element) {
  _clearStateAndSetCursor(element, 'none');
}

function _clearStateAndSetCursor(element, cursorSeting) {
  if (state.svgCursorUrl) {
    window.URL.revokeObjectURL(state.svgCursorUrl);
  }

  state.svgCursorUrl = null;
  element.style.cursor = cursorSeting;
}
