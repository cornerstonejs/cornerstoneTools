export class ClickedLineData {
  /* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */
  constructor (toolIndex, handleIndexArray) {
    this._toolIndex = toolIndex;
    this._handleIndexArray = handleIndexArray;
  }

  get toolIndex () {
    return this._toolIndex;
  }

  get handleIndexArray () {
    return this._handleIndexArray;
  }
}
