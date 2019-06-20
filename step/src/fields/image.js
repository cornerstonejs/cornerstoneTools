class ImageField extends PixelField {
  constructor(options={}) {
    super(options);
    this.analyze();
  }

  analyze() {
    super.analyze();
    this.windowCenter = Number(this.dataset.WindowCenter[0]);
    this.windowWidth = Number(this.dataset.WindowWidth[0]);
    this.rescaleIntercept = Number(this.dataset.RescaleIntercept);
    this.rescaleSlope = Number(this.dataset.RescaleSlope);
    this.samplesPerPixel = Number(this.dataset.SamplesPerPixel);

    if (this.dataset.BitsAllocated != 16) {
      console.error('Can only handle 16 bit data');
    }

    if (! this.dataset.SamplesPerPixel in [1,3]) {
      console.error('Can only handle 1 or 3 samples per pixel');
    }

    // array of control points in form [value, {r, g, b, a}]
    this.transferFunction = [
      [0, {r: 0, g: 0, b: 0, a: 0}],
      [1, {r: 1, g: 1, b: 1, a: 1}],
    ];
  }

  statistics(options={}) {
    let statistics = {};
    statistics.bins = options.bins || 256;
    let samples = options.samples || 1000;

    let imageArray;
    if (this.dataset.PixelRepresentation == 1) {
      imageArray = new Int16Array(this.dataset.PixelData);
    } else {
      imageArray = new Uint16Array(this.dataset.PixelData);
    }

    let min = 3e38;
    let max = -3e38;
    for (let index = 0; index < samples; index++) {
      let sampleIndex = Math.floor(imageArray.length * Math.random());
      min = Math.min(min, imageArray[sampleIndex]);
      max = Math.max(max, imageArray[sampleIndex]);
    }
    statistics.range = {min, max};

    let histogram = new Int32Array(statistics.bins);
    let binScale = statistics.bins / (max - min);
    for (let index = 0; index < samples; index++) {
      let sampleIndex = Math.floor(imageArray.length * Math.random());
      let bin = Math.floor((imageArray[sampleIndex] - min) * binScale);
      histogram[bin] += 1;
    }
    statistics.histogram = histogram;

    statistics.maxBin = 0;
    statistics.maxBinValue = 0;
    for (let bin = 0; bin < statistics.bins; bin++) {
      if (statistics.histogram[bin] > statistics.maxBinValue) {
        statistics.maxBin = bin;
        statistics.maxBinValue = statistics.histogram[bin];
      }
    }

    return(statistics);
  }

  uniforms() {
    // TODO: need to be keyed to id (in a struct)
    let u = super.uniforms();
    u['windowCenter'+this.id] = {type: "1f", value: this.windowCenter};
    u['windowWidth'+this.id] = {type: "1f", value: this.windowWidth};
    u['rescaleSlope'+this.id] = {type: "1f", value: this.rescaleSlope};
    u['rescaleIntercept'+this.id] = {type: "1f", value: this.rescaleIntercept};
    // add transfer function control point uniforms
    for (let index = 0; index < this.transferFunction.length; index++) {
      let [value, rgba] = this.transferFunction[index];
      rgba = [rgba.r, rgba.g, rgba.b, rgba.a];
      u['tfcp'+this.id+'value'+index] = {type: '1f', value: value};
      u['tfcp'+this.id+'rgba'+index] = {type: '4fv', value: rgba};
    }
    return(u);
  }

  rescaleSource() {
    return(`
      uniform float rescaleSlope${this.id};
      uniform float rescaleIntercept${this.id};
      float rescale${this.id}(const in float sampleValue) {
        return(rescaleSlope${this.id} * sampleValue + rescaleIntercept${this.id});
      }
    `);
  }

  transferFunctionControlPointUniformSource() {
    let uniformSource = '\n';
    for (let index = 0; index < this.transferFunction.length; index++) {
      uniformSource += `uniform float tfcp${this.id}value${index};\n`;
      uniformSource += `uniform vec4 tfcp${this.id}rgba${index};\n`;
    }
    return(uniformSource);
  }

  transferFunctionControlPointLookupSource() {
    let lookupSource = '\n';
    let index = 0;
    lookupSource += `
      if (pixelValue < tfcp${this.id}value${index}) {
        color = tfcp${this.id}rgba${index}.rgb;
        opacity = tfcp${this.id}rgba${index}.a;
      }\n`;
    for (index = 1; index < this.transferFunction.length; index++) {
      lookupSource += `
        else if (pixelValue < tfcp${this.id}value${index}) {
          float proportion = (pixelValue - tfcp${this.id}value${index-1}) /
            (tfcp${this.id}value${index} - tfcp${this.id}value${index-1});
          color = mix( tfcp${this.id}rgba${index-1}.rgb,
                       tfcp${this.id}rgba${index}.rgb,
                       proportion );
          opacity = mix( tfcp${this.id}rgba${index-1}.a,
                         tfcp${this.id}rgba${index}.a,
                         proportion );
        }\n`;
    }
    lookupSource += `
      else {
        color = tfcp${this.id}rgba${index-1}.rgb;
      }\n`;
    return(lookupSource);
  }

  transferFunctionSource() {
    return(`
      uniform float windowCenter${this.id};
      uniform float windowWidth${this.id};
      uniform vec4 rgba${this.id};
      uniform float gradientOpacityScale${this.id};
      ${this.transferFunctionControlPointUniformSource()}
      void transferFunction${this.id} (const in float sampleValue,
                                       const in float gradientMagnitude,
                                       out vec3 color,
                                       out float opacity)
      {
        float pixelValue = 0.5 +
                (sampleValue - (windowCenter${this.id}-0.5))
                  / (windowWidth${this.id}-1.);
        pixelValue = clamp( pixelValue, 0., 1. );

        if (sliceMode == 1) {
          color = vec3(pixelValue);
          opacity = rgba${this.id}.a;
        } else {
          ${this.transferFunctionControlPointLookupSource()}
          float gradientContribution = gradientMagnitude * gradientOpacityScale${this.id};
          color += gradientContribution * rgba${this.id}.rgb;
          opacity += gradientContribution;
          opacity *= rgba${this.id}.a;
        }
        color *= rgba${this.id}.rgb;
      }
    `);
  }

  fieldToTexture(gl) {
    // allocate and fill a float 3D texture for the image data.
    // cannot be subclassed.
    let needsUpdate = super.fieldToTexture(gl);
    if (needsUpdate) {
      let imageArray;
      if (this.dataset.PixelRepresentation == 1) {
        imageArray = new Int16Array(this.dataset.PixelData);
      } else {
        imageArray = new Uint16Array(this.dataset.PixelData);
      }

      let imageTextureArray;
      let pixelInternalFormat; // format of the target texture
      let pixelFormat; // format of the passed array
      let pixelType; // data type of passed array
      let textureFilters;
      if (this.useIntegerTextures) {
        imageTextureArray = new Int16Array(imageArray);
        pixelInternalFormat = gl.R16I;
        pixelFormat = gl.RED_INTEGER;
        pixelType = gl.SHORT;
        textureFilters = gl.NEAREST;
      } else {
        imageTextureArray = new Float32Array(imageArray);
        pixelInternalFormat = gl.R16F;
        pixelFormat = gl.RED;
        pixelType = gl.FLOAT;
        textureFilters = gl.LINEAR;
      }

      let [w,h,d] = this.pixelDimensions;
      gl.texStorage3D(gl.TEXTURE_3D, 1, pixelInternalFormat, w, h, d);
      if (!this.generator) {
        // only transfer the data if there's no generator that will fill it in
        gl.texSubImage3D(gl.TEXTURE_3D,
                         0, 0, 0, 0, // level, offsets
                         w, h, d,
                         pixelFormat, pixelType, imageTextureArray);
      }
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, textureFilters);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, textureFilters);
      this.updated();
    }
  }
}
