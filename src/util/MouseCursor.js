const mousePosition = '4 4';

export default class MouseCursor {
  constructor(svgString) {
    this.blob = new Blob([svgString], { type: 'image/svg+xml' });
    this.mousePoint = mousePosition;
  }
}
