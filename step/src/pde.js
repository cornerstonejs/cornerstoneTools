class PDEGenerator extends FilterGenerator {
  // Performs a partial differential equation image evolution calculation
  // inputFields are:
  // - 0 grayscale image
  // - 1 current phiValue image
  // outputFields are:
  // - 0 new phiValue image
  constructor(options={}) {
    super(options);
  }

  updateProgram() {
    // recreate the program and textures for the current field list
    super.updateProgram();
    let gl = this.gl;
  }

  _fragmentShaderSource() {
    return (`${this.headerSource()}

      // these are the function definitions for sampleVolume*
      // and transferFunction*
      // that define a field at a sample point in space for each input field
      ${function() {
          let perFieldSamplingShaderSource = '';
          this.inputFields.forEach(field=>{
            perFieldSamplingShaderSource += field.transformShaderSource();
            perFieldSamplingShaderSource += field.samplingShaderSource();
          });
          return(perFieldSamplingShaderSource);
        }.bind(this)()
      }

      uniform int iterations;
      uniform int iteration;

      // integer sampler for first input Field
      uniform ${this.samplerType} inputTexture0;
      uniform ${this.samplerType} inputTexture1;
      // scaling between texture coordinates and pixels, i.e. 1/256.0
      uniform vec3 pixelToTexture0;

      // output into first Field
      layout(location = 0) out ${this.bufferType} value;

      // Coordinate of input location, could be resampled elsewhere.
      in vec3 interpolatedTextureCoordinate;

      // Radius and gaussian parameters
      uniform float deltaT;
      uniform float edgeWeight;


      void main()
      {
        float background, backgroundGradientMagnitude;
        float phi, phiGradientMagnitude;
        vec3 backgroundNormal, phiNormal;

        sampleTexture0(inputTexture0, textureToPatient0(interpolatedTextureCoordinate), 0.01,
                      background, backgroundNormal, backgroundGradientMagnitude);
        sampleTexture1(inputTexture1, textureToPatient0(interpolatedTextureCoordinate), 0.01,
                      phi, phiNormal, phiGradientMagnitude);

        if (iteration == 0) {
          vec3 pixelCenter = vec3(0.5) / pixelToTexture0;
          vec3 pixelCoordinate = interpolatedTextureCoordinate / pixelToTexture0;
          vec4 patientCenter = pixelToPatient0 * vec4(pixelCenter, 1.);
          vec4 patientCoordinate = pixelToPatient0 * vec4(pixelCoordinate, 1.);
          float distance = length(patientCoordinate - patientCenter);

          if (distance < 30. && distance > 5.) {
            value = (30. - distance) * 15.;
          } else {
            value = 0.;
          }
        } else {
          value = phi + deltaT * (
                          - .125 * phi
                          + .5 * phiGradientMagnitude / (1. + edgeWeight * backgroundGradientMagnitude)
          );
        }
      }
    `);
  }
}
