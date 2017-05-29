/* eslint no-bitwise:0 */

export default function (which, mouseButtonMask) {
  const mouseButton = (1 << (which - 1));


  return ((mouseButtonMask & mouseButton) !== 0);
}
