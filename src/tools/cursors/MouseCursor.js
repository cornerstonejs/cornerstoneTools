import toolColors from '../../stateManagement/toolColors.js';
import { modules } from '../../store/index.js';

const cursorModule = modules.cursor;

/*
MACROS:

The following keys will have the appropriate value injected when
the SVG is requested:

- ACTIVE_COLOR  => options.activeColor || toolColors.getActiveColor();
- TOOL_COLOR    => options.toolColor || toolColors.getToolColor();
- FILL_COLOR    => options.fillColor || toolColors.getFillColor();
*/

export default class MouseCursor {
  constructor(iconGroupString, options) {
    this.iconGroupString = iconGroupString;
    this.options = Object.assign(
      {},
      cursorModule.getters.defaultOptions(),
      options
    );
  }

  getIconSVG(options = {}) {
    const svgString = this._generateIconSVGString(options);

    return new Blob([svgString], { type: 'image/svg+xml' });
  }

  getIconSVGString(options = {}) {
    return this._generateIconSVGString(options);
  }

  getIconWithPointerSVG(options = {}) {
    const svgString = this._generateIconWithPointerSVGString(options);

    return new Blob([svgString], { type: 'image/svg+xml' });
  }

  getIconWithPointerString(options = {}) {
    return this._generateIconWithPointerSVGString(options);
  }

  get mousePoint() {
    const mousePoint = this.options.mousePoint;

    return `${mousePoint.x} ${mousePoint.y}`;
  }

  _generateIconWithPointerSVGString(options = {}) {
    const svgOptions = Object.assign({}, this.options, options);
    const { mousePointerGroupString, iconSize, viewBox } = svgOptions;

    const scale = iconSize / Math.max(viewBox.x, viewBox.y);
    const svgSize = 16 + iconSize;

    const svgString = `
        <svg
        data-icon="cursor" role="img" xmlns="http://www.w3.org/2000/svg"
        width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}"
      >
        <g>
          ${mousePointerGroupString}
        </g>
        <g transform="translate(16, 16) scale(${scale})">
          ${this.iconGroupString}
        </g>
      </svg>`;

    return this._injectColors(svgString, svgOptions);
  }

  _generateIconSVGString(options = {}) {
    const svgOptions = Object.assign({}, this.options, options);
    const { iconSize, viewBox } = svgOptions;

    const svgString = `
      <svg
        data-icon="cursor" role="img" xmlns="http://www.w3.org/2000/svg"
        width="${iconSize}" height="${iconSize}" viewBox="0 0
        ${viewBox.x} ${viewBox.y}"
      >
        ${this.iconGroupString}
      </svg>`;

    return this._injectColors(svgString, svgOptions);
  }

  _injectColors(svgString, options = {}) {
    const activeColor = options.activeColor || toolColors.getActiveColor();
    const toolColor = options.toolColor || toolColors.getToolColor();
    const fillColor = options.fillColor || toolColors.getFillColor();

    return svgString
      .replace(/ACTIVE_COLOR/g, `${activeColor}`)
      .replace(/TOOL_COLOR/g, `${toolColor}`)
      .replace(/FILL_COLOR/g, `${fillColor}`);
  }
}
