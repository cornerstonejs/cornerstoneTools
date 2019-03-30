import debug from 'debug';

const BASE_SCOPE = 'cornerstoneTools';
const log = debug(BASE_SCOPE);

export const logger = scope => log.extend(scope);
export const enable = () => debug.enable(BASE_SCOPE);
export const disable = () => debug.disable(BASE_SCOPE);
