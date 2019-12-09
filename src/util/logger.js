/**
 * @method debug
 * Create's a debuging logger
 */

export const getLogger = () => {
  return {
    // eslint-disable-next-line no-console
    log: console.log.bind(console),
    // eslint-disable-next-line no-console
    warn: console.warn.bind(console),
    // eslint-disable-next-line no-console
    error: console.error.bind(console),
  };
};
