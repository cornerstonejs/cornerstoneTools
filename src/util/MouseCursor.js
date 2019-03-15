import mouseCursorPoints from './mouseCursorPoints.js';

export default class MouseCursor {
  constructor(svgString, mousePoint) {
    this.blob = new Blob([svgString], { type: 'image/svg+xml' });
    this.mousePoint = mousePoint || mouseCursorPoints.topLeft;
  }
}
