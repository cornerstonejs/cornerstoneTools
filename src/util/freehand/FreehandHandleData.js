export class FreehandHandleData {
  constructor (position, highlight = true, active = true) {
    this.x = position.x;
    this.y = position.y;
    this.highlight = highlight;
    this.active = active;
    this.lines = [];
  }
}
