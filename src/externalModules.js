let cornerstone = window.cornerstone;
let cornerstoneMath = window.cornerstoneMath;
let Hammer = window.Hammer;

export default {
  set cornerstone(cs) {
    cornerstone = cs;
  },
  get cornerstone() {
    return cornerstone;
  },
  set cornerstoneMath(cm) {
    cornerstoneMath = cm;
  },
  get cornerstoneMath() {
    return cornerstoneMath;
  },
  set Hammer(module) {
    Hammer = module;
  },
  get Hammer() {
    return Hammer;
  },
};
