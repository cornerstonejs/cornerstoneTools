/**
 * Returns the first argument if defined, otherwise returns the second
 *
 * @param {any} value
 * @param {any} defaultValue
 */
export function getDefault (value, defaultValue) {
    return value !== undefined ? value : defaultValue;
}
