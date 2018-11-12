/**
 *  Enumerates the modes for a CornestoneTools tool. A tool's mode
 *  defines in what way it is rendered and responds to user input.
 *  @enum {String}
 *  @memberof CornerstoneTools
 *  @readonly
 */
const ToolMode = {
  /**
   *  Active tools will render and respond to user input. Active tools are able to create new annotations and/or measurements.
   *  @type {String}
   */
  ACTIVE: 'active',

  /**
   *  Passive tools will render and passively respond to user input. Their data can be manipulated, but not createed.
   *  @type {String}
   */
  PASSIVE: 'passive',

  /**
   *  Enabled tools will render, but will not respond to input. The "enabled" tool state is essentially a "read-only" state.
   *  @type {String}
   */
  ENABLED: 'enabled',

  /**
   *  The default state for a tool. Tools that are disabled cannot be interacted with and are not rendered on the enabled element.
   *  @type {String}
   */
  DISABLED: 'disabled',
};

export default ToolMode;
