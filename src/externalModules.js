import $ from 'jquery';
import Hammer from 'hammerjs';
import * as cornerstoneMath from 'cornerstone-math';

let cornerstone = window.cornerstone;

const external = {
  set cornerstone (cs) {
    cornerstone = cs;
  },
  get cornerstone () {
    return cornerstone;
  }
};

export { $, Hammer, cornerstoneMath, external };
