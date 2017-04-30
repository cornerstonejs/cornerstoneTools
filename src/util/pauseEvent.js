/**
 * This function is used to prevent selection from occuring when left click dragging on the image
 * @param e the event that is provided to your event handler
 * Based on: http://stackoverflow.com/questions/5429827/how-can-i-prevent-text-element-selection-with-cursor-drag
 * @returns {boolean}
 */
export default function (e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }

  if (e.preventDefault) {
    e.preventDefault();
  }

  e.cancelBubble = true;
  e.returnValue = false;

  return false;
}
