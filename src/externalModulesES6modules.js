import * as cornerstone from '../../cornerstone/src/index.js';
import * as dicomParser from '../../dicomParser/src/index.js';
import * as cornerstoneMath from '../../cornerstoneMath/src/index.js';
const $ = window.$;
const Hammer = window.Hammer;

let cornerstone = window.cornerstone;

const external = {
  set cornerstone (cs) {
    cornerstone = cs;
  },
  get cornerstone () {
    return cornerstone;
  }
};

export { $, Hammer, external, cornerstoneMath };