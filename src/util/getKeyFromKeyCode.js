/**
 * Returns a string representation of the a key, given a keycode. Useful for
 * hooking up api calls to buttons using external libraries.
 * @export @public @method
 * @name getKeyFromKeyCode
 *
 * @param  {number} keyCode The keycode to look up.
 * @returns {string} The corresponding character.
 */
export default function (keyCode) {
  return KEY_CODES[keyCode];
}

const KEY_CODES = {
  // Numbers - above letter keys
  48: '0',
  49: '1',
  50: '2',
  51: '3',
  52: '4',
  53: '5',
  54: '6',
  55: '7',
  56: '8',
  57: '9',

  // Numbers - numpad
  96: '0',
  97: '1',
  98: '2',
  99: '3',
  100: '4',
  101: '5',
  102: '6',
  103: '7',
  104: '8',
  105: '9',

  // Letters
  65: 'a',
  66: 'b',
  67: 'c',
  68: 'd',
  69: 'e',
  70: 'f',
  71: 'g',
  72: 'h',
  73: 'i',
  74: 'j',
  75: 'k',
  76: 'l',
  77: 'm',
  78: 'n',
  79: 'o',
  80: 'p',
  81: 'q',
  82: 'r',
  83: 's',
  84: 't',
  85: 'u',
  86: 'v',
  87: 'w',
  88: 'x',
  89: 'y',
  90: 'z',

  // Function keys
  112: 'F1',
  113: 'F2',
  114: 'F3',
  115: 'F4',
  116: 'F5',

  // Command keys
  13: 'RETURN',
  8: 'BACKSPACE',
  9: 'TAB',
  46: 'DELETE',
  12: 'DELETE',
  27: 'ESCAPE',
  20: 'CAPSLOCK',

  // Misc - NOTE: There are multiple keycodes for certain characters due to browsers having different mappings.
  173: '-',
  189: '-',
  109: '-',
  61: '+',
  187: '+',
  107: '+',
  219: '[',
  221: ']',
  59: ';',
  186: ';',
  188: ',',
  190: '.',
  199: '/'
};
