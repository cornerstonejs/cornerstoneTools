class View {
  // All the parameters of the view (camera plus planes and other options)
  constructor(options={}) {
    let c = Linear.vclone;
    this.viewPoint = c(options.viewPoint) || [0., 0., -30.];
    this.viewNormal = Linear.vnormalize(options.viewNormal || [0., 0., 1.5]);
    this.viewUp = Linear.vnormalize(options.viewUp || [0., -1., 0.]);
    this.viewDistance = options.viewDistance || Linear.vlength(this.viewPoint);
    this.viewBoxMin = c(options.viewBoxMin) || [-3., -3., -3.];
    this.viewBoxMax = c(options.viewBoxMax) || [3., 3., 3.];
    this.viewAngle = options.viewAngle || 30.;
    this.viewNear = 0.;
    this.viewFar = 3e+38;  // basically float max

    this.look();
  }

  uniforms() {
    let halfSinViewAngle = 0.5 * Math.sin(this.viewAngle * Math.PI/180.);
    return({
      viewPoint: { type: '3fv', value: this.viewPoint },
      viewNormal: { type: '3fv', value: this.viewNormal },
      viewRight: { type: '3fv', value: this.viewRight },
      viewUp: { type: '3fv', value: this.viewUp },
      viewBoxMin: { type: '3fv', value: this.viewBoxMin },
      viewBoxMax: { type: '3fv', value: this.viewBoxMax },
      halfSinViewAngle: { type: '1f', value: halfSinViewAngle },
      viewNear: { type: '1f', value: this.viewNear },
      viewFar: { type: '1f', value: this.viewFar },
    });
  }

  target() {
    this.viewNormal = Linear.vnormalize(this.viewNormal);
    return(Linear.vplus(this.viewPoint, Linear.vscale(this.viewNormal, this.viewDistance)));
  }

  look(options={}) {
    let at = options.at || this.target();
    let from = options.from || this.viewPoint;
    let up = options.up || this.viewUp;
    let bounds = options.bounds;

    if (bounds) {
      this.viewBoxMin = bounds.min;
      this.viewBoxMax = bounds.max;
    }
    this.viewNormal = Linear.vnormalize(Linear.vminus(at, from));
    this.viewRight = Linear.vnormalize(Linear.vcross(this.viewNormal, up));
    this.viewUp = Linear.vcross(this.viewRight, this.viewNormal);
    this.viewPoint = Linear.vclone(from);
    this.viewDistance = Linear.vdistance(at, from);
  }

  slice(options={}) {
    let plane = options.plane || "axial";
    let offset = options.offset || 0.5;
    let thickness = options.thickness || 0.;
    let bounds = options.bounds || {min: this.viewBoxMin, max: this.viewBoxMax};
    let magnification = options.magnification || 1.;
    let target = options.target || Linear.vscale(Linear.vplus(bounds.min, bounds.max), offset);
    let extent = options.extent || Linear.vminus(bounds.max, bounds.min);

    // TODO: doublecheck these with Slicer
    switch (plane) {
      case "axial": {
        // looking from below at LPS slice
        this.viewRight = [1, 0, 0];
        this.viewUp = [0, -1, 0];
        this.viewNormal = [0, 0, 1];
        this.viewPoint = [0, 0, -1];
      }
      break;
      case "sagittal": {
        // nose pointing left
        this.viewRight = [0, 1, 0];
        this.viewUp = [0, 0, 1];
        this.viewNormal = [-1, 0, 0];
        this.viewPoint = [1, 0, 0];
      }
      break;
      case "coronal": {
        this.viewRight = [1, 0, 0];
        this.viewUp = [0, 0, 1];
        this.viewNormal = [0, 1, 0];
        this.viewPoint = [0, -1, 0];
      }
      break;
      default: {
        console.log('Unknown slice plane', plane);
      }
    }

    let extentRight = Linear.vlength(Linear.vdot(extent, this.viewRight));
    let windowRight = extentRight / magnification;
    this.viewDistance = windowRight / Math.tan(this.viewAngle * Math.PI/180.);
    let viewOffset = Linear.vscale(this.viewPoint, this.viewDistance);
    this.viewPoint = Linear.vplus(target, viewOffset);

    this.viewNear = this.viewDistance - 0.5 * thickness;
    this.viewFar = this.viewDistance + 0.5 * thickness;
  }

  orbit (rightward, upward) {
    let target = this.target();
    let vTargetToOrigin = Linear.vscale(target, -1);
    let mTargetToOrigin = Linear.mtranslate(vTargetToOrigin);
    let mAboutUp = Linear.mrotate(this.viewUp, rightward);
    let mAboutRight = Linear.mrotate(this.viewRight, upward);
    let mTargetFromOrigin = Linear.mtranslate(this.target());
    let rotation = Linear.mmultiply(mTargetFromOrigin,
                    Linear.mmultiply(mAboutRight,
                      Linear.mmultiply(mAboutUp, mTargetToOrigin)));
    let newViewPoint = Linear.mvmultiply(rotation, [...this.viewPoint,1]).slice(0,3);
    this.look({from: newViewPoint, at: target});
  }
}
