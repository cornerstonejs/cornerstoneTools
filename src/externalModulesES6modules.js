import * as dicomParser from '../../dicomParser/src/index.js';
import * as cornerstoneMath from '../../cornerstoneMath/src/index.js';
const $ = window.$;
const Hammer = window.Hammer;
let cornerstone;

function storeCornerstone(cs) {
  cornerstone = cs;
}

function getCornerstone() {
  return cornerstone;
}

export { $, Hammer, storeCornerstone, getCornerstone, cornerstoneMath };
