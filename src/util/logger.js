import debugLib from './debugLib/index.js';

const BASE_SCOPE = 'cornerstoneTools';
const baseLogger = debugLib(BASE_SCOPE);

// eslint-disable-next-line no-process-env
const devMode = process.env.NODE_ENV === 'development';

// If we're in dev-mode, tell the user how to get logs
if (devMode && !baseLogger.enabled) {
  // eslint-disable-next-line no-console
  console.log(
    '%cCornerstone Tools',
    'background: #339955; padding: 4px; font-weight: bold; color: white'
  );

  // eslint-disable-next-line no-console
  console.info(
    'run %clocalStorage.setItem("debug", "cornerstoneTools")%c to see console output',
    'background: #eaeaea; color: #333; font-family: monospace',
    ''
  );
}

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
 * @param {string} scope The scope to enabled
 * @returns {void}
 */
export const enable = (scope = `${BASE_SCOPE}:*`) => debugLib.enable(scope);

/**
 * @method disable
 * @param {string} scope
 * @returns {string} The previously enabled scope
 */
export const disable = () => debugLib.disable();
