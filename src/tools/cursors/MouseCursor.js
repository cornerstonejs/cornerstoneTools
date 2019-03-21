import toolColors from '../../stateManagement/toolColors.js';

const mousePosition = '8 8';
// TODO -> Change color based on usage?
// TODO -> White is probably the second worst color to black for being displayed
// over medical images.
//

const defaultOptions = {
  iconSize: 16,
  viewBox: {
    x: 32,
    y: 32,
  },
};

export default class MouseCursor {
  constructor(svgGroupString, options) {
    this.svgGroupString = svgGroupString;
    this.options = options;

    const svgString = this._generateSVGString();

    this.blob = new Blob([svgString], { type: 'image/svg+xml' });
    this.mousePoint = mousePosition;
  }

  _generateSVGString() {
    const svgOptions = Object.assign(defaultOptions, this.options);
    const viewBox = svgOptions.viewBox;
    const scale = svgOptions.iconSize / Math.max(viewBox.x, viewBox.y);
    const activeColor = toolColors.getActiveColor();

    return `
    <svg
    data-icon="cursor" role="img" xmlns="http://www.w3.org/2000/svg"
    width="48" height="48" viewBox="0 0 48 48"
  >
    <g>
      <path stroke="${activeColor}" d="M8 16L8 0" id="dUU9BLALA"></path>
      <path stroke="${activeColor}" d="M16 8L0 8" id="b9wR4oWz"></path>
    </g>
    <g transform="translate(16, 16) scale(${scale})">
      ${this.svgGroupString.replace(/ACTIVE_COLOR/g, `${activeColor}`)}
    </g>
  </svg>`;
  }

  get iconSVG() {
    const svgOptions = Object.assign(defaultOptions, this.options);
    const viewBox = svgOptions.viewBox;

    const svgString = `
    <svg
      data-icon="cursor" role="img" xmlns="http://www.w3.org/2000/svg"
      width="32" height="32" viewBox="0 0 ${viewBox.x} ${viewBox.y}"
    >
      ${this.svgGroupString.replace(
        /ACTIVE_COLOR/g,
        `${toolColors.getActiveColor()}`
      )}
    </svg>`;

    return new Blob([svgString], { type: 'image/svg+xml' });
  }
}
