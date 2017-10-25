import * as cornerstoneMath from '../../cornerstoneMath/src/index.js';

let cornerstone = window.cornerstone;
let $ = window.$;
let Hammer = window.Hammer;

const external = {
  set cornerstone (cs) {
    cornerstone = cs;
  },
  get cornerstone () {
    return cornerstone;
  },
  set $ (module) {
    $ = module;
  },
  get $ () {
    return $;
  },
  set Hammer (module) {
    Hammer = module;
  },
  get Hammer () {
    return Hammer;
  }
};

export { external, cornerstoneMath };
