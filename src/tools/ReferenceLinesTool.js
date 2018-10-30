/* eslint class-methods-use-this: 0 */
import external from './../externalModules.js';
import BaseTool from './../base/BaseTool.js';

import { getNewContext } from '../drawing/index.js';
import { addToolState, getToolState } from './../stateManagement/toolState.js';
import renderActiveReferenceLine from './referenceLines/renderActiveReferenceLine.js';

/**
 * When enabled, this tool will display references lines for each source
 * enabledElement in the provided synchronizer. This tool can also be configured
 * to use a custom renderer for alternative reference line rendering behavior
 *
 * TODO: Need to watch for configuration changes to update ToolState
 * TODO:
 *
 * @export @public @class
 * @name ReferenceLinesTool
 * @classdesc Tool for displaying reference lines of other enabledElements
 * @extends BaseTool
 */
export default class ReferenceLinesTool extends BaseTool {
  constructor (configuration = {}) {
    const defaultConfig = {
      name: 'ReferenceLines',
      mixins: ['enabledOrDisabledBinaryTool'],
      configuration: {
        renderer: renderActiveReferenceLine
      }
    };

    const initialConfiguration = Object.assign(defaultConfig, configuration);

    super(initialConfiguration);
    this.initialConfiguration = initialConfiguration;
  }

  enabledCallback (element, { synchronizationContext } = {}) {
    const renderer = this.configuration.renderer;

    addToolState(element, this.name, {
      synchronizationContext,
      renderer
    });
    this.forceImageUpdate(element);
  }

  disabledCallback (element) {
    this.forceImageUpdate(element);
  }

  forceImageUpdate (element) {
    const enabledElement = external.cornerstone.getEnabledElement(element);

    if (enabledElement.image) {
      external.cornerstone.updateImage(element);
    }
  }

  renderToolData (evt) {
    const eventData = evt.detail;
    const toolData = getToolState(evt.currentTarget, this.name);

    // No tool data? Bail out
    if (toolData === undefined) {
      return;
    }

    const { renderer, synchronizationContext } = toolData.data[0];

    // No renderer or synch context? Adios
    if (renderer === undefined || synchronizationContext === undefined) {
      return;
    }

    // Get the enabled elements associated with this synchronization context and draw them
    const enabledElements = synchronizationContext.getSourceElements();
    const context = getNewContext(eventData.canvasContext.canvas);

    external.cornerstone.setToPixelCoordinateSystem(eventData.enabledElement, context);
    enabledElements.forEach((referenceEnabledElement) => {

      // Don't draw ourselves
      if (referenceEnabledElement === evt.currentTarget) {
        return;
      }

      // Render it
      renderer(context, eventData, evt.currentTarget, referenceEnabledElement);
    });

  }
}
