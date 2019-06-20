function testNLM(options) {

  let seriesKey = [
    '[["UnspecifiedInstitution","123456"],["Slicer Sample Data","1.2.826.0.1.3680043.2.1125.1.34027065691713096181869243555208536"],["MR","No series description","1.2.826.0.1.3680043.2.1125.1.60570920072252354871500178658621494"]]',
  ];
  step.chronicle.seriesOperation({
    chronicle: step.chronicle,
    key: JSON.parse(seriesKey),
    operation: requestSeries
  });

  setTimeout ( function() {
  
  options = options || {
    patchRadius : 10,
    searchRadius : 7,
    bandwidth : 10.,
    sigma : 1.,
  };
    return (performImageFilter(NonLocalMeansGenerator, options));
    
  }, 4000);

}


class NonLocalMeansGenerator extends FilterGenerator {
  // Performs a Non-local means filter
  // following http://web.stanford.edu/class/ee367/reading/A%20non-local%20algorithm%20for%20image%20denoising.pdf
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
    this.uniforms.patchRadius = {type: '1i', value: this.options.patchRadius};
    this.uniforms.searchRadius = {type: '1i', value: this.options.searchRadius};
    this.uniforms.sigma = {type: '1f', value: this.options.sigma};
    this.uniforms.bandwidth = {type: '1f', value: this.options.bandwidth};
  }

  _fragmentShaderSource() {

    return (`${this.headerSource()}

      // NonLocalMeans
      //
      // Filter inputTexture0 using a nonlocal means filter.  This is a single pass algorithm,
      // with fixed sigmas and radius.
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

      // constants
      const float pi = 3.1415926535897932384626433832795;
      const float sqrt_2_pi = 2.5066282746310002;


      // uniforms
      uniform int patchRadius;
      uniform int searchRadius;
      uniform float bandwidth;
      uniform float sigma;


      // from:
      // http://web.stanford.edu/class/ee367/reading/A%20non-local%20algorithm%20for%20image%20denoising.pdf
      // ftp://ftp.math.ucla.edu/pub/camreport/cam08-01.pdf
      void doNLM()
      {
        float gaussianScale = 1.0 / ( sqrt_2_pi * sigma );
        float twoSigmaSquared = 2.0 * sigma * sigma;
        float bandwidthSquared = bandwidth * bandwidth;

        float background  = float(texture(inputTexture0, interpolatedTextureCoordinate).r);
        float outputValue = 0.0;
        float z           = 0.0;

        for (int i = -searchRadius; i <= searchRadius; ++i) {
          for (int j = -searchRadius; j <= searchRadius; ++j) {
            for (int k = -searchRadius; k <= searchRadius; ++k) {

              vec3 patchCenter = interpolatedTextureCoordinate + vec3(i,j,k) * pixelToTexture0;

              float sumOfDifferences = 0.0;

              for (int x = -patchRadius; x <= patchRadius; ++x) {
                for (int y = -patchRadius; y <= patchRadius; ++y) {
                  for (int z = -patchRadius; z <= patchRadius; ++z) {

                    // calculate the difference between this patch and the pixel to filter
                    vec3 offset = vec3(x,y,z) * pixelToTexture0;
                    float diff = float (
                        texture(inputTexture0, interpolatedTextureCoordinate+offset).r -
                        texture(inputTexture0, patchCenter+offset).r );
                    float distanceScale = gaussianScale * exp ( - dot(offset,offset) / twoSigmaSquared );
                    sumOfDifferences = sumOfDifferences + distanceScale * diff * diff;
                  }         
                }
              }
              float w          = 0.0;
              w = exp ( -sumOfDifferences / twoSigmaSquared );
              w = sumOfDifferences;
              w = exp ( -w / bandwidthSquared );
 
             // finished calculating the weight of the patch, now accumulate
             outputValue = outputValue + w * float(texture(inputTexture0, patchCenter));
             // w = 1.0;
             z = z + w;
            }
          }
        }
        outputValue = outputValue / z;
        value = ${this.bufferType} ( outputValue ); // cast if needed
      }

      void main() {
        doNLM();
        if ( false ) {
          vec3 patchCenter = vec3(50, 50, 50) * pixelToTexture0;
          float outputValue  = float(texture(inputTexture0, interpolatedTextureCoordinate - patchCenter).r);
          value = ${this.bufferType} ( outputValue ); // cast if needed
        }
      }

    `);
  }
}
