/**
 * Determine the coordinates that will place the textbox to the right of the
 * annotation, taking rotation, hflip, and vflip into account.
 *
 * @param {Object} viewport - The object that stores rotation, hflip, and vflip.
 * @param {Object[]} handles - The handles of the annotation.
 * @returns {Object} - The coordinates for default placement of the textbox
 */
export default function getROITextBoxCoords(viewport, handles) {
  const hflip = viewport.hflip;
  const vflip = viewport.vflip;
  const rotation = viewport.rotation;
  const handlesLeftToRight = [handles.start, handles.end].sort(_compareX);
  const handlesTopToBottom = [handles.start, handles.end].sort(_compareY);
  const left = handlesLeftToRight[0];
  const right = handlesLeftToRight[handlesLeftToRight.length - 1];
  const top = handlesTopToBottom[0];
  const bottom = handlesTopToBottom[handlesTopToBottom.length - 1];
  const centerX = (left.x + right.x) / 2;
  const centerY = (left.y + right.y) / 2;
  const textBox = {};

  if (rotation >= 0 && rotation < 90) {
    textBox.x = hflip ? left.x : right.x;
    textBox.y = centerY;
  }
  if (rotation >= 90 && rotation < 180) {
    textBox.x = centerX;
    textBox.y = vflip ? bottom.y : top.y;
  }
  if (rotation >= 180 && rotation < 270) {
    textBox.x = hflip ? right.x : left.x;
    textBox.y = centerY;
  }
  if (rotation >= 270 && rotation < 360) {
    textBox.x = centerX;
    textBox.y = vflip ? top.y : bottom.y;
  }

  return textBox;
}

function _compareX(a, b) {
  return a.x < b.x ? -1 : 1;
}
function _compareY(a, b) {
  return a.y < b.y ? -1 : 1;
}
