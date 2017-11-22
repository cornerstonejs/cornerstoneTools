let cornerstone = window.cornerstone;
let cornerstoneMath = window.cornerstoneMath;
let $ = window.$;
let Hammer = window.Hammer;

export default {
  set cornerstone (cs) {
    cornerstone = cs;
  },
  get cornerstone () {
    return cornerstone;
  },
  set cornerstoneMath (cm) {
    cornerstoneMath = cm;
  },
  get cornerstoneMath () {
    return cornerstoneMath;
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
