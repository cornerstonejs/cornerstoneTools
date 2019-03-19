import toolColors from '../stateManagement/toolColors.js';

const mousePosition = '8 8';
// TODO -> Change color based on usage?
// TODO -> White is probably the second worst color to black for being displayed
// over medical images.
//

const defaultOptions = {
  iconSize: 32,
  viewBox: {
    x: 32,
    y: 32,
  },
};

export default class MouseCursor {
  constructor(svgGroupString, options) {
    const svgString = this._generateSVGString(svgGroupString, options);

    console.log(svgString);

    this.blob = new Blob([svgString], { type: 'image/svg+xml' });
    this.mousePoint = mousePosition;
  }

  _generateSVGString(svgGroupString, options) {
    const svgOptions = Object.assign(defaultOptions, options);

    console.log(svgOptions);
    const viewBox = svgOptions.viewBox;
    const scale = svgOptions.iconSize / Math.max(viewBox.x, viewBox.y);
    const crosshairColor =
      svgOptions.crosshairColor || toolColors.getActiveColor();

    return `
    <svg
    data-icon="cursor" role="img" xmlns="http://www.w3.org/2000/svg"
    width="48" height="48" viewBox="0 0 48 48"
  >
    <g>
      <path stroke="${crosshairColor}" d="M8 16L8 0" id="dUU9BLALA"></path>
      <path stroke="${crosshairColor}" d="M16 8L0 8" id="b9wR4oWz"></path>
    </g>
    <g transform="translate(16, 16) scale(${scale})">
      ${svgGroupString.replace(
        /ACTIVE_COLOR/g,
        `${toolColors.getActiveColor()}`
      )}
    </g>
  </svg>`;
  }
}
