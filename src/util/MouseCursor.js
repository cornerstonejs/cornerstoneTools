import mouseCursorPoints from './mouseCursorPoints.js';

export default class MouseCursor {
  constructor(svgString, mousePoint = mouseCursorPoints.topLeft) {
    this.blob = new Blob([svgString], { type: 'image/svg+xml' });

    if (mouseCursorPoints[mousePoint]) {
      this.mousePoint = mouseCursorPoints[mousePoint];
    } else {
      this.mousePoint = mousePoint;
    }
  }
}
