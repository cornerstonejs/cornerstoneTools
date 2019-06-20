class TransformField extends PixelField {
  constructor(options={}) {
    super(options);
    this.analyze();
  }

  dimensions() {
    let grid = this.dataset.DeformableRegistration.DeformableRegistrationGrid;
    return(grid.GridDimensions.map(Number));
  }

  orientation() {
    let grid = this.dataset.DeformableRegistration.DeformableRegistrationGrid;
    return(grid.ImageOrientationPatient.map(Number));
  }

  spacing() {
    let grid = this.dataset.DeformableRegistration.DeformableRegistrationGrid;
    return(grid.GridResolution.map(Number));
  }

  position(frame) {
    frame = frame || 0;
    let grid = this.dataset.DeformableRegistration.DeformableRegistrationGrid;
    let origin = grid.ImagePositionPatient.map(Number);
    let sliceStep = this.sliceStepFromOrientation(this.orientation());
    let sliceSpacing = this.spacing()[2];
    vec3.scale(sliceStep, sliceStep, frame * sliceSpacing);
    let framePosition = vec3.create();
    vec3.add(framePosition, origin, sliceStep);
    return(framePosition)
  }

  analyze() {
    super.analyze();
  }

  uniforms() {
    // TODO: need to be keyed to id (in a struct)

    let u = super.uniforms();
    return(u);
  }

  samplingShaderSource() {
    return(`
      uniform highp ${this.samplerType} textureUnit${this.id};

      void transferFunction${this.id} (const in float sampleValue,
                                       const in float gradientMagnitude,
                                       out vec3 color,
                                       out float opacity)
      {
        color = vec3(sampleValue, 0.5, 2.);
        opacity = gradientMagnitude;
      }

      uniform int visible${this.id};
      uniform mat4 patientToPixel${this.id};
      uniform mat4 pixelToPatient${this.id};
      uniform mat3 normalPixelToPatient${this.id};
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
      // TODO
        vec3 stpPoint = patientToTexture${this.id}(patientPoint);
        normal = texture(textureUnit, stpPoint).xyz;
        sampleValue = length(normal);
        gradientMagnitude = sampleValue;
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
          sampleValue = 100.;
          normal = vec3(1.);
          gradientMagnitude = 1.;
          sampleTexture${this.id}(textureUnit, samplePoint, gradientSize,
                                  sampleValue, normal, gradientMagnitude);
        }
      }
    `);
  }

  fieldToTexture(gl) {
    // allocate and fill a float 3D texture for the image data.
    // cannot be subclassed.
    let needsUpdate = super.fieldToTexture(gl);
    if (needsUpdate) {

      let grid = this.dataset.DeformableRegistration.DeformableRegistrationGrid;
      
      let [w,h,d] = this.pixelDimensions;
      gl.texStorage3D(gl.TEXTURE_3D, 1, gl.RGBA32F, w, h, d);
      if (!this.generator) {
        // only transfer the data if there's no generator that will fill it in
        // the texture must be rgba so it can be rendered into
        // so we make a new buffer with 4 components
        // TODO: if this becomes and efficiency issue the process
        // could be implemented in a shader
        let vectorCount = w*h*d;
        let rgbaArray = new Float32Array(vectorCount*4);
        for (let vectorIndex of Array(vectorCount).keys()) {
          rgbaArray[4*vectorIndex  ] = grid.VectorGridData[3*vectorIndex];
          rgbaArray[4*vectorIndex+1] = grid.VectorGridData[3*vectorIndex+1];
          rgbaArray[4*vectorIndex+2] = grid.VectorGridData[3*vectorIndex+2];
          rgbaArray[4*vectorIndex+3] = 0.;
        }
        gl.texSubImage3D(gl.TEXTURE_3D,
                         0, 0, 0, 0, // level, offsets
                         w, h, d,
                         gl.RGBA, gl.FLOAT, rgbaArray);
      }
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      this.updated();
    }
  }
}
