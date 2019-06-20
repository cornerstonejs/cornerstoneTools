class BilateralGenerator extends FilterGenerator {
  // Performs a bilateral filter
  // inputFields are:
  // - 0 grayscale image
  // outputFields are:
  // - 0 new filtered image
  constructor(options={}) {
    super(options);
    this.options = options.options;
  }

  updateProgram() {
    // recreate the program and textures for the current field list
    super.updateProgram();
    let gl = this.gl;
    this.uniforms.kernelSize = {type: '1i', value: this.options.kernelSize};
    this.uniforms.sigmaSpace = {type: '1f', value: this.options.sigmaSpace};
    this.uniforms.sigmaRange = {type: '1f', value: this.options.sigmaRange};
  }

  _fragmentShaderSource() {
    console.log ( "Bilateral brute..." );

    return (`${this.headerSource()}

      // Bilateral
      //
      // Filter inputTexture0 using a bilateral filter.  This is a single pass algorithm,
      // with fixed sigmas for intensity and range.
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

      // Radius and gaussian parameters
      uniform int kernelSize;
      uniform float sigmaSpace;
      uniform float sigmaRange;


      const float pi = 3.1415926535897932384626433832795;
      const float sqrt_2_pi = 2.5066282746310002;

      float gaussian ( float v, float sigma, float sigma_squared ) {
        float num = exp ( - ( v*v ) / ( 2.0 * sigma_squared ));
        float den = sqrt_2_pi * sigma;
        return num / den;
      }

      // From https://people.csail.mit.edu/sparis/bf_course/course_notes.pdf
      void doBilateralFilter()
      {
        float sigmaSpaceSquared = sigmaSpace * sigmaSpace;
        float sigmaRandeSquared = sigmaRange * sigmaRange;
        float background = float(texture(inputTexture0, interpolatedTextureCoordinate).r);
        float v = 0.0;
        float w = 0.0;
        for (int i = -kernelSize; i <= kernelSize; i++) {
          for (int j = -kernelSize; j <= kernelSize; j++) {
            for (int k = -kernelSize; k <= kernelSize; k++) {
              vec3 offset = vec3(i,j,k) * pixelToTexture0;
              vec3 neighbor = interpolatedTextureCoordinate + offset;
              float neighborStrength = float(texture(inputTexture0, neighbor).r);

              float ww = 0.0;
              ww = gaussian ( distance(offset, interpolatedTextureCoordinate), sigmaSpace, sigmaSpaceSquared ) ;
              ww *= gaussian ( background - neighborStrength, sigmaRange, sigmaRandeSquared );
              w += ww;
              v += ww * neighborStrength;
            }
          }
        }
        v = v / w;
        value = ${this.bufferType} ( v ); // cast if needed
      }
      void main()
      {
        doBilateralFilter();
      }
 
    `);
  }
}
