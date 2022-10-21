import BaseAnnotationTool from './BaseAnnotationTool.js';

/**
 * @memberof Tools.Base
 * @classdesc Abstract class for tools which create and display annotations with measurments on the
 * cornerstone canvas.
 * @extends Tools.Base.BaseAnnotationTool
 */
class BaseMeasurementTool extends BaseAnnotationTool {
  /**
   * Updates weather the uncertainties should be displayed or not.
   * The tool options can be changed during runtime overriding the tool configuration.
   *
   * @param {*} image
   * @param {*} element
   * @param {*} data
   * @returns {void}
   */
  get displayUncertainties() {
    return typeof this.options.displayUncertainties === 'undefined'
      ? Boolean(this.configuration.displayUncertainties)
      : Boolean(this.options.displayUncertainties);
  }
}

export default BaseMeasurementTool;
