import external from './../externalModules.js';
import BaseTool from './base/BaseTool.js';

import { getNewContext } from '../drawing/index.js';
import renderActiveReferenceLine from './referenceLines/renderActiveReferenceLine.js';
import { waitForEnabledElementImageToLoad } from '../util/wait.js';
import { getLogger } from '../util/logger.js';

const logger = getLogger('tools:ReferenceLinesTool');

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
 * @extends Tools.Base.BaseTool
 */
export default class ReferenceLinesTool extends BaseTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'ReferenceLines',
      mixins: ['enabledOrDisabledBinaryTool'],
      configuration: {
        renderer: renderActiveReferenceLine,
      },
    };

    super(props, defaultProps);

    this.renderer = null;
    this.synchronizationContext = null;
  }

  async enabledCallback(element, { synchronizationContext } = {}) {
    const renderer = this.configuration.renderer;
    const enabledElement = await waitForEnabledElementImageToLoad(element);

    if (!enabledElement || !renderer || !synchronizationContext) {
      // TODO: Unable to add tool state, image never loaded.
      // Should we `setToolDisabledForElement` here?
      logger.warn(
        `Unable to enable ${this.name}. Exiting enable callback. Tool will be enabled, but will not render.`
      );

      return;
    }
    this.renderer = renderer;
    this.synchronizationContext = synchronizationContext;

    this.forceImageUpdate(element);
  }

  disabledCallback(element) {
    this.forceImageUpdate(element);
  }

  forceImageUpdate(element) {
    const enabledElement = external.cornerstone.getEnabledElement(element);

    if (enabledElement.image) {
      external.cornerstone.updateImage(element);
    }
  }

  renderToolData(evt) {
    const eventData = evt.detail;

    // No renderer or synch context? Adios
    if (!this.renderer || !this.synchronizationContext) {
      return;
    }

    // Get the enabled elements associated with this synchronization context and draw them
    const enabledElements = this.synchronizationContext.getSourceElements();
    const context = getNewContext(eventData.canvasContext.canvas);

    external.cornerstone.setToPixelCoordinateSystem(
      eventData.enabledElement,
      context
    );
    enabledElements.forEach(referenceEnabledElement => {
      // Don't draw ourselves
      if (referenceEnabledElement === evt.currentTarget) {
        return;
      }

      // Render it
      this.renderer(
        context,
        eventData,
        evt.currentTarget,
        referenceEnabledElement
      );
    });
  }
}
