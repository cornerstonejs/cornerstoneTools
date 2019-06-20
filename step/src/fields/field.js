class Field {
  constructor(options={}) {
    this.useIntegerTextures = Field.useIntegerTextures;
    this.id = Field.nextId;
    this.texture = undefined;
    this.modifiedTime = Number.MAX_VALUE;
    this.updatedTime = 0;
    this.bounds = undefined; // the spatial extent of the field.
                             // undefined means there is no bound, otherwise
                             // an object with min and max

    // viewing parameters
    this.visible = 1; // integer so it can be passed as a uniform
    this.rgba = options.rgba || [1., 1., 1., 1.]; // base color
    this.rgba = this.rgba.map(e=>e*1.00001); // hack to make it floating point
    this.gradientOpacityScale = options.gradientOpacityScale || 0.0005;

    this.generator = options.generator || undefined; // the generator that populates the texture

    // transform parameters
    this.transformGain = options.transformGain || 1.; // for visualizing/animating/exaggerating transform
    this.transformField = undefined; // the field that defines the deformation

    if (this.useIntegerTextures) {
      this.samplerType = "isampler3D";
    } else {
      this.samplerType = "sampler3D";
    }

    Field.nextId++; // keep track of IDs statically for class
  }

  analyze() {
    // calculate things like bounds from the constructor input
    // - this method is called by the final concrete subtype and
    //   every subclass calls the superclass
  }

  // user of this class is responsible for calling modified
  // after making changes that require updating the gl representation
  modified() {
    this.modifiedTime = window.performance.now(); // TODO: maybe use incrementing Number
  }

  updated() {
    this.updatedTime = window.performance.now();
  }

  needsUpdate() {
    return this.updatedTime < this.modifiedTime;
  }

  // ShaderSources return a string with these functions implemented in GLSL
  transformShaderSource() {
    if (this.transformField) {
      return (`
        uniform float transformGain${this.id};
        vec3 transformPoint${this.id}(const in vec3 samplePoint)
        {
          vec3 transformSTPPoint = patientToTexture${this.transformField.id}(samplePoint);
          vec3 displacement = texture(textureUnit${this.transformField.id}, transformSTPPoint).xyz;
          return(samplePoint + transformGain${this.id} * displacement);
        }
      `);
    } else {
      return (`
        vec3 transformPoint${this.id}(const in vec3 samplePoint)
        {
          return(samplePoint);
        }
      `);
    }
  }

  samplingShaderSource() {
    // return a string with these functions implemented in GLSL
    return(`
      void transferFunction${this.id} (const in float sampleValue,
                                       const in float gradientMagnitude,
                                       out vec3 color,
                                       out float opacity)
      {
      }
      void sampleField${this.id} (const in ${this.samplerType} textureUnit,
                                  const in vec3 samplePointPatient,
                                  const in float gradientSize,
                                  out float sampleValue,
                                  out vec3 normal,
                                  out float gradientMagnitude)
      {
      }
    `);
  }

  uniforms() {
    // return an object of the current uniform values
    let u = {};
    u['visible'+this.id] = {type: '1i', value: this.visible};
    u['rgba'+this.id] = {type: '4fv', value: this.rgba};
    u['gradientOpacityScale'+this.id] = {type: '1f', value: this.gradientOpacityScale};
    u['textureUnit'+this.id] = {type: '1i', value: this.id};
    if (this.transformField) {
      u['transformGain'+this.id] = {type: '1f', value: this.transformGain};
    }
    return(u);
  }

  fieldToTexture(gl) {
    // ensure the field data is stored in the texture
    // unit associated with this.id in the gl context
    // returns true if subclass also needs to update.
    // Final child class should call this.updated().
    let needsUpdate = this.needsUpdate();
    if (needsUpdate) {
      if (this.texture) {
        gl.deleteTexture(this.texture);
      }
      this.texture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0+this.id);
      gl.bindTexture(gl.TEXTURE_3D, this.texture);
    }
    return needsUpdate;
  }

}
Field.nextId = 0; // TODO: for now this is texture unit
Field.useIntegerTextures = false; // default, but possibly overridden based on gl env

// array of fields from dataset
Field.fromDataset = function(dataset) {
  let fields = [];
  let sopClassName = dcmjs.data.DicomMetaDictionary.sopClassNamesByUID[dataset.SOPClassUID];

  switch (sopClassName) {
    case "CTImage":
    case "MRImage":
    case "EnhancedCTImage":
    case "LegacyConvertedEnhancedCTImage":
    case "UltrasoundMultiframeImage":
    case "MRImage":
    case "EnhancedMRImage":
    case "MRSpectroscopy":
    case "EnhancedMRColorImage":
    case "LegacyConvertedEnhancedMRImage":
    case "UltrasoundImage":
    case "EnhancedUSVolume":
    case "SecondaryCaptureImage":
    case "USImage":
    case "PETImage":
    case "EnhancedPETImage":
    case "LegacyConvertedEnhancedPETImage": {
      fields = [new ImageField({dataset})];
    }
    break;
    case "Segmentation": {
      fields = SegmentationField.fieldsFromDataset({dataset});
    }
    break;
    case "DeformableSpatialRegistration": {
      fields = [new TransformField({dataset})];
    }
    break;
    default: {
      console.error('Cannot process this dataset type ', dataset);
    }

   /* TODO
     "Raw Data",
     "Spatial Registration",
     "Spatial Fiducials",
     "Real World Value Mapping",
     "BasicTextSR",
     "EnhancedSR",
     "ComprehensiveSR",
   */
  }
  return (fields);
}
