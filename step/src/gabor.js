class GaborGenerator extends FilterGenerator {
  // Performs a similarity filter
  // inputFields are:
  // - (None)
  // outputFields are:
  // - 0 new gabor filter based on the parameters
  constructor(options={}) {
    super(options);
    this.options = options.options;
  }

  updateProgram() {
    // recreate the program and textures for the current field list
    super.updateProgram();
    let gl = this.gl;
    this.uniforms.sigma = {type: '1f', value: this.options.sigma};
    this.uniforms.frequency = {type: '1f', value: this.options.frequency};
    this.uniforms.phase = {type: '1f', value: this.options.phase};
    this.uniforms.kernelSize = {type: '1i', value: this.options.kernelSize};
    this.uniforms.rotationSample = {type: '1i', value: this.options.rotationSample};
  }

  _fragmentShaderSource() {
    console.log ( "Gabor..." );

    return (`${this.headerSource()}

      // Gabor
      //
      // Implement a 3D Gabor filter
      //

      // consts
      ${CommonGL.pi()}

      // output into first Field
      layout(location = 0) out ${this.bufferType} value;

      // Coordinate of input location
      in vec3 interpolatedTextureCoordinate;

      // parameters
      uniform int kernelSize;
      uniform int rotationSample;

      // CommonGL code
      ${CommonGL.fibonacciSphere()}
      ${CommonGL.isoCorners()}
      ${CommonGL.rotationFromVector()}
      ${CommonGL.rotateAroundPoint()}
      ${CommonGL.gabor()}

      void main()
      {
        const vec3 center = vec3(0.5);

        mat3 rotation = rotationFromVector(isoCorners(rotationSample));
        mat4 transform = rotateAroundPoint(rotation, center);
        vec3 samplePoint = (transform * vec4(interpolatedTextureCoordinate, 1.)).xyz;
        
        float signal = gabor(samplePoint, center);

        value = ${this.bufferType} (1000. * signal);
      }
    `);
  }
}
