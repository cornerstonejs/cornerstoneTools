class GaussianGenerator extends FilterGenerator {
  // Performs a gaussian filter
  // inputFields are:
  // - 0 grayscale image
  // outputFields are:
  // - 0 new filtered image
  constructor(options={}) {
    super(options);
  }

  updateProgram() {
    // recreate the program and textures for the current field list
    super.updateProgram();
    let gl = this.gl;
  }

  _fragmentShaderSource() {
    console.log ( "Half..." );

    return (`${this.headerSource()}

      // Gaussian
      //
      // Filter inputTexture0 using a gaussian filter.  This is a single pass algorithm,
      // with fixed sigma.
      //


      // these are the function definitions for sampleVolume*
      // and transferFunction*
      // that define a field at a sample point in space
      ${function() {
          let perFieldSamplingShaderSource = '';
          this.inputFields.forEach(field=>{
            perFieldSamplingShaderSource += field.transformShaderSource();
            perFieldSamplingShaderSource += field.samplingShaderSource();
          });
          return(perFieldSamplingShaderSource);
        }.bind(this)()
      }

      // integer sampler for first input Field
      uniform ${this.samplerType} inputTexture0;
      // scaling between texture coordinates and pixels, i.e. 1/256.0
      uniform vec3 pixelToTexture0;

      // output into first Field
      layout(location = 0) out ${this.bufferType} value;

      // Coordinate of input location, could be resampled elsewhere.
      in vec3 interpolatedTextureCoordinate;

      // Radius, must change the kernel if the radius is changed...
      const int r = 3;
      // Gaussian Kernel, sigma = 5
      float kernel[2*r+1] = float[](
        0.12895603354653198, 0.14251845798601478, 0.15133130724683985,
        0.15438840244122673,
        0.15133130724683985, 0.14251845798601478, 0.12895603354653198
      );

      void main()
      {
        ${this.bufferType} background = texture(inputTexture0, interpolatedTextureCoordinate).r;
        float accumulator = 0.0;
        for (int i = -r; i <= r; i++) {
          float ikernel = kernel[i + r];
          for (int j = -r; j <= r; j++) {
            float jkernel = kernel[j + r];
            for (int k = -r; k <= r; k++) {
              float kkernel = kernel[k + r];

              vec3 offset = vec3(i,j,k) * pixelToTexture0;
              vec3 neighbor = interpolatedTextureCoordinate + offset;
              float neighborStrength = float(texture(inputTexture0, neighbor).r);

              accumulator = accumulator + neighborStrength * kkernel * jkernel * ikernel;
            }
          }
        }
        value = ${this.bufferType} (accumulator);
      }
    `);
  }
}
