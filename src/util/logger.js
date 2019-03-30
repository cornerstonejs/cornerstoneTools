import debugLib from 'debug';

const BASE_SCOPE = 'cornerstoneTools';
const baseLogger = debugLib(BASE_SCOPE);

// TODO: Have webpack set this appropriately
const devMode = true;

/**
 * @method debug
 * Create's a scoped debuging logger
 */

export const getLogger = scope => {
  const log = baseLogger.extend(scope);

  return {
    log,

    // Warnings should always be output to the brower console
    // in development mode
    warn(...params) {
      if (devMode) {
        // If in development mode - use console.warn directly
        // eslint-disable-next-line no-console
        console.warn.apply(null, params);
      } else {
        // Otherwise use log
        log(...params);
      }
    },

    // Errors should always be output to the browser console
    error(...prarms) {
      // eslint-disable-next-line no-console
      console.error.apply(null, prarms);
    },
  };
};

/**
 * @method enable
 * @returns {void}
 */
export const enable = () => debugLib.enable(BASE_SCOPE);

/**
 * @method disable
 * @returns {void}
 */
export const disable = () => debugLib.disable(BASE_SCOPE);
