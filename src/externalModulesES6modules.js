import * as cornerstoneMath from '../../cornerstoneMath/src/index.js';
const $ = window.$;
const Hammer = window.Hammer;

export default {
  $,
  Hammer,
  cornerstoneMath,
  set cornerstone(cs) {
    this.cornerstone = cs;
  },
  get cornerstone() {
    return this.cornerstone;
  }
};
