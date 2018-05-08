export default function clip (val, low, high) {
  // Clip a value to an upper and lower bound.
  return Math.min(Math.max(low, val), high);
}

export function clipToBox (point, box) {
  // Clip an {x, y} point to a box of size {width, height}
  point.x = clip(point.x, 0, box.width);
  point.y = clip(point.y, 0, box.height);
}
