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

  // Max size of 128x128
  // Use 32 to be safe
  const cursorBlob = tool.svgCursor;

  const svgCursorUrl = window.URL.createObjectURL(cursorBlob);

  console.log(element.style.cursor);
  element.style.cursor = `url('${svgCursorUrl}') 5 5, auto`;

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
