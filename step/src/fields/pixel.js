class PixelField extends Field {
  constructor(options={}) {
    super(options);
    this.dataset = options.dataset || {};
  }

  dimensions() {
    return([this.dataset.Columns,
            this.dataset.Rows,
            this.dataset.NumberOfFrames].map(Number));
  }

  orientation() {
    return(this.dataset.SharedFunctionalGroupsSequence.PlaneOrientation.ImageOrientationPatient.map(Number));
  }

  sliceStepFromOrientation(orientation) {
    let columnStepToPatient = vec3.fromValues(...orientation.slice(0,3));
    let rowStepToPatient = vec3.fromValues(...orientation.slice(3,6));
    let sliceStepToPatient = vec3.create();
    vec3.cross(sliceStepToPatient, columnStepToPatient, rowStepToPatient);
    return(sliceStepToPatient);
  }

  spacing() {
    let pixelMeasures = this.dataset.SharedFunctionalGroupsSequence.PixelMeasuresSequence;
    // NB: DICOM PixelSpacing is defined as Row then Column, unlike ImageOrientationPatient
    // Convention for fields is always that pixel space is column, row, slice so we swap
    // the first two entries here.
    return([pixelMeasures.PixelSpacing[1],
            pixelMeasures.PixelSpacing[0],
            pixelMeasures.SpacingBetweenSlices].map(Number));
  }

  position(frame) {
    frame = frame || 0;
    let perFrameGroups = this.dataset.PerFrameFunctionalGroupsSequence;
    return(perFrameGroups[frame].PlanePosition.ImagePositionPatient.map(Number));
  }

  analyze() {
    super.analyze();
    // examine the dataset and calculate intermediate values needed for rendering
    // TODO: patientToPixel and related matrices should be generalized to functions.
    // TODO: transfer function parameters could be textures.

    this.pixelDimensions = this.dimensions();

    let [spacingBetweenColumns,
         spacingBetweenRows,
         spacingBetweenSlices] = this.spacing();

    let orientation = this.orientation();
    let sliceStepToPatient = this.sliceStepFromOrientation(orientation);

    let columnStepToPatient = vec3.fromValues(...orientation.slice(0,3));
    let rowStepToPatient = vec3.fromValues(...orientation.slice(3,6));
    vec3.scale(columnStepToPatient, columnStepToPatient, spacingBetweenColumns);
    vec3.scale(rowStepToPatient, rowStepToPatient, spacingBetweenRows);
    vec3.scale(sliceStepToPatient, sliceStepToPatient, spacingBetweenSlices);

    let origin = vec3.fromValues(...this.position(0));
    if (this.pixelDimensions[2] > 1) {
      let position1 = vec3.fromValues(...this.position(1));
      let originToPosition1 = vec3.create();
      vec3.subtract(originToPosition1, position1, origin);
      if (vec3.dot(sliceStepToPatient, originToPosition1) < 0) {
        vec3.scale(sliceStepToPatient, sliceStepToPatient, -1.);
      }
    }

    // matrix from pixel coordinates IJK (0 to N-1) to sampling space (patient, mm) and inverse
    this.pixelToPatient = mat4.fromValues(...columnStepToPatient, 0,
                                          ...rowStepToPatient, 0,
                                          ...sliceStepToPatient, 0,
                                          ...origin, 1);
    let patientToPixel = mat4.create();
    mat4.invert(patientToPixel, this.pixelToPatient);
    this.patientToPixel = patientToPixel.valueOf();

    // TODO:
    // the inverse transpose of the upper 3x3 of the pixelToPatient matrix,
    // which is the transpose of the upper 3x3 of the patientToPixel matrix
    /*
    let p = this.patientToPixel;
    this.normalPixelToPatient = [
      p[0][0], p[0][1], p[0][2],
      p[1][0], p[1][1], p[1][2],
      p[2][0], p[2][1], p[2][2],
    ];
    */

    // the bounds are the outer corners of the very first and very last
    // pixels of the dataset measured in pixel space
    let halfSpacings = vec4.fromValues(0.5, 0.5, 0.5, 0.);
    vec4.transformMat4(halfSpacings, halfSpacings, this.pixelToPatient);
    let firstCorner = vec3.create();
    vec3.subtract(firstCorner, origin, halfSpacings);
    let dimensions = vec4.fromValues(...this.pixelDimensions,1);
    let secondCorner4 = vec4.create();
    vec4.transformMat4(secondCorner4, dimensions, this.pixelToPatient);
    vec4.subtract(secondCorner4, secondCorner4, halfSpacings);
    let secondCorner = vec3.fromValues(...secondCorner4.valueOf().slice(0,3));
    let min = vec3.create();
    let max = vec3.create();
    vec3.min(min, firstCorner, secondCorner);
    vec3.max(max, firstCorner, secondCorner);
    this.bounds = {min : min.valueOf(), max : max.valueOf()};

    let center = vec3.create();
    vec3.add(center, min, max);
    vec3.scale(center, center, 0.5);
    this.center = center.valueOf();
  }

  uniforms() {
    let u = super.uniforms();
    // u['normalPixelToPatient'+this.id] = {type: "Matrix3fv", value: this.normalPixelToPatient},
    u['patientToPixel'+this.id] = {type: "Matrix4fv", value: this.patientToPixel};
    u['pixelToPatient'+this.id] = {type: "Matrix4fv", value: this.pixelToPatient};
    u['pixelDimensions'+this.id] = {type: '3iv', value: this.pixelDimensions};
    let pixelToTexture = this.pixelDimensions.map(e=>1./e);
    u['pixelToTexture'+this.id] = {type: '3fv', value: pixelToTexture};
    return(u);
  }

  fieldToTexture(gl) {
    // common texture operations for all pixel-based fields
    let needsUpdate = super.fieldToTexture(gl);
    if (needsUpdate) {
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_BASE_LEVEL, 0);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAX_LEVEL, 0);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
    }
    return needsUpdate;
  }

  rescaleSource() {
    // identity, but overridden for images
    return(`
      float rescale${this.id}(const in float sampleValue) {
        return(sampleValue);
      }
    `);
  }

  transferFunctionSource() {
    // null, but overridden for images and segmentations
    return(`
      void transferFunction${this.id} (const in float sampleValue,
                                       const in float gradientMagnitude,
                                       out vec3 color,
                                       out float opacity)
      {
        color = vec3(0., 0., 0.);
        opacity = 0.;
      }
    `);
  }

  samplingShaderSource() {
    return(`
      uniform highp ${this.samplerType} textureUnit${this.id};

      ${this.rescaleSource()}
      ${this.transferFunctionSource()}

      uniform int visible${this.id};
      uniform mat4 patientToPixel${this.id};
      uniform mat4 pixelToPatient${this.id};
      // uniform mat3 normalPixelToPatient${this.id}; not currently used
      uniform ivec3 pixelDimensions${this.id};

      vec3 patientToTexture${this.id}(const in vec3 patientPoint)
      {
        // stpPoint is in 0-1 texture coordinates, meaning that it
        // is the patientToPixel transform scaled by the inverse
        // pixel dimensions.
        vec3 pixelDimensions = vec3(pixelDimensions${this.id});
        vec3 dimensionsInverse = vec3(1.) / pixelDimensions;
        vec3 stpPoint = (patientToPixel${this.id} * vec4(patientPoint, 1.)).xyz;
        stpPoint *= dimensionsInverse;
        return(stpPoint);
      }

      vec3 textureToPatient${this.id}(const in vec3 stpPoint)
      {
        // inverse operation of patientToTexture
        vec3 pixelDimensions = vec3(pixelDimensions${this.id});
        vec3 patientPoint = (pixelToPatient${this.id} * vec4(pixelDimensions * stpPoint, 1.)).xyz;
        return(patientPoint);
      }

      void sampleTexture${this.id}(const in ${this.samplerType} textureUnit,
                                   const in vec3 patientPoint,
                                   const in float gradientSize,
                                   out float sampleValue,
                                   out vec3 normal,
                                   out float gradientMagnitude)
      {

        #define SAMPLE(p) rescale${this.id}(float( texture(textureUnit, p).r ))

        vec3 stpPoint = patientToTexture${this.id}(patientPoint);
        sampleValue = SAMPLE(stpPoint);

        // central difference sample gradient (P is +1, N is -1)
        // p : point in patient space
        // o : offset vector in patient space along dimension
        vec3 sN = vec3(0.);
        vec3 sP = vec3(0.);
        vec3 offset = vec3(0.);
        for (int i = 0; i < 3; i++) {
          offset[i] = gradientSize;
          sP[i] = SAMPLE(patientToTexture${this.id}(patientPoint + offset));
          offset[i] = -gradientSize;
          sN[i] = SAMPLE(patientToTexture${this.id}(patientPoint + offset));
          offset[i] = 0.;
        }
        vec3 gradient = vec3( (sP[0]-sN[0]),
                              (sP[1]-sN[1]),
                              (sP[2]-sN[2]) );
        gradientMagnitude = length(gradient);
        normal = gradient * 1./gradientMagnitude;

        #undef SAMPLE
      }

      void sampleField${this.id} (const in ${this.samplerType} textureUnit,
                                  const in vec3 samplePointPatient,
                                  const in float gradientSize,
                                  out float sampleValue,
                                  out vec3 normal,
                                  out float gradientMagnitude)
      {
        // samplePoint is in patient coordinates, stp is texture coordinates
        vec3 samplePoint = transformPoint${this.id}(samplePointPatient);
        vec3 stpPoint = patientToTexture${this.id}(samplePoint);

        // trivial reject outside
        if (any(lessThan(stpPoint, vec3(0.)))
             || any(greaterThan(stpPoint,vec3(1.)))) {
          sampleValue = 0.;
          normal = vec3(0.);
          gradientMagnitude = 0.;
        } else {
          sampleTexture${this.id}(textureUnit, samplePoint, gradientSize,
                                  sampleValue, normal, gradientMagnitude);
        }
      }
    `);
  }
}
