class GrowCutGenerator extends ProgrammaticGenerator {
  // Performs on iteration of GrowCut.
  // inputFields are:
  // - 0 grayscale image
  // - 1 current label image
  // - 2 current strength image
  // outputFields are:
  // - 0 new label image
  // - 1 new strength image
  constructor(options={}) {
    super(options);
    this.uniforms.iteration = { type: '1i', value: 0 };
    this.uniforms.iterations = { type: '1i', value: 0 };
  }

  headerSource() {
    return (`${super.headerSource()}
      const int sliceMode = 1; // used for texture sampling (get value not transfer function)
    `);
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

      #define MAX_STRENGTH ${this.bufferType}(10000)

      uniform int iterations;
      uniform int iteration;

      uniform ${this.samplerType} inputTexture0; // background
      uniform ${this.samplerType} inputTexture1; // label
      uniform ${this.samplerType} inputTexture2; // strength

      in vec3 interpolatedTextureCoordinate;

      layout(location = 0) out ${this.bufferType} label;
      layout(location = 1) out ${this.bufferType} strength;

      void main()
      {
        ivec3 size = textureSize(inputTexture0, 0);
        ivec3 texelIndex = ivec3(floor(interpolatedTextureCoordinate * vec3(size)));
        ${this.bufferType} background = texelFetch(inputTexture0, texelIndex, 0).r;

        if (iteration == 0) {
          if (background < ${this.bufferType}(10)) {
            label = ${this.bufferType}(30);
            strength = MAX_STRENGTH;
          } else if (background > ${this.bufferType}(100)) {
            label = ${this.bufferType}(100);
            strength = MAX_STRENGTH;
          } else {
            label = ${this.bufferType}(0);
            strength = ${this.bufferType}(0);
          }
        } else {
          label = texelFetch(inputTexture1, texelIndex, 0).r;
          strength = texelFetch(inputTexture2, texelIndex, 0).r;
          for (int k = -1; k <= 1; k++) {
            for (int j = -1; j <= 1; j++) {
              for (int i = -1; i <= 1; i++) {
                if (i != 0 && j != 0 && k != 0) {
                  ivec3 neighborIndex = texelIndex + ivec3(i,j,k);
                  ${this.bufferType} neighborBackground = texelFetch(inputTexture0, neighborIndex, 0).r;
                  ${this.bufferType} neighborStrength = texelFetch(inputTexture2, neighborIndex, 0).r;
                  ${this.bufferType} strengthCost = abs(neighborBackground - background);
                  ${this.bufferType} takeoverStrength = neighborStrength - strengthCost;
                  if (takeoverStrength > strength) {
                    strength = takeoverStrength;
                    label = texelFetch(inputTexture1, neighborIndex, 0).r;
                  }
                }
              }
            }
          }
        }
      }
    `);
  }
}
