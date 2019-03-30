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
    // eslint-disable-next-line no-console
    warn: devMode ? console.warn.bind(console) : log,
    // eslint-disable-next-line no-console
    error: console.error.bind(console),
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
