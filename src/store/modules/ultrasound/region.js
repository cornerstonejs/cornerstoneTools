// This is based on the DICOM standard for the specification of the sequence of ultrasund regions
// http://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_C.8.5.5.html#table_C.8-17
export default class UltrasoundRegion {
  constructor(region) {
    this.spatialFormat = region.uint16('x00186012');
    this.dataType = region.uint16('x00186014');
    this.regionFlags = region.uint16('x00186016');
    this.x0 = region.uint32('x00186018');
    this.y0 = region.uint32('x0018601a');
    this.x1 = region.uint32('x0018601c');
    this.y1 = region.uint32('x0018601e');
    this.physicalDeltaX = region.double('x0018602c');
    this.physicalDeltaY = region.double('x0018602e');
    this.physicalUnitsX = region.uint16('x00186024');
    this.physicalUnitsY = region.uint16('x00186026');
    this.referencePixelX0 = region.int32('x00186020');
    this.referencePixelY0 = region.int32('x00186022');
    this.referencePixelPhysicalValueX = region.double('x00186028');
    this.referencePixelPhysicalValueY = region.double('x0018602a');
    this.transducerFrequency = region.uint32('x00186030');
    this.pulseRepetitionFrequency = region.uint32('x00186030');
    this.dopplerCorrectionAngle = region.double('x00186034');
    this.steeringAngle = region.double('x00186036');
    this.dopplerSampleVolumeXPosition = region.int32('x00186039');
    this.dopplerSampleVolumeYPosition = region.int32('x0018603b');
    this.tmLinePositionX0 = region.int32('x0018603d');
    this.tmLinePositionY0 = region.int32('x0018603f');
    this.tmLinePositionX1 = region.int32('x00186041');
    this.tmLinePositionY1 = region.int32('x00186043');
    this.pixelPriority = this.extractBit(0);
    this.scalingProtection = this.extractBit(1);
    this.dopplerScaleType = this.extractBit(2);
    this.scrollingRegion1 = this.extractBit(3);
    this.scrollingRegion2 = this.extractBit(4);
    this.pixelComponentOrganization = region.uint16('x00186044');
    this.pixelComponentMask = region.uint32('x00186046');
    this.contains.bind(this);
    this.extractBit.bind(this);
    this.area.bind(this);
    this.units.bind(this);
  }

  contains(pt) {
    const { x0, x1, y0, y1 } = this;
    const { x, y } = pt;

    return x >= x0 && x <= x1 && y >= y0 && y <= y1;
  }

  extractBit(bit) {
    const { regionFlags } = this;

    return (regionFlags & (1 << bit)) >> bit;
  }

  area() {
    const { x0, x1, y0, y1 } = this;

    return Math.abs(x1 - x0) * Math.abs(y1 - y0);
  }

  units() {
    const { physicalUnitsX, physicalUnitsY } = this;

    if (
      physicalUnitsX === undefined ||
      physicalUnitsX === null ||
      physicalUnitsY === undefined ||
      physicalUnitsY === null ||
      physicalUnitsX !== physicalUnitsY
    ) {
      return 'pixels';
    }

    switch (physicalUnitsX) {
      case 0:
        return '';
      case 1:
        return '%';
      case 2:
        return 'dB';
      case 3:
        return 'cm';
      case 4:
        return 'sec';
      case 5:
        return 'Hz';
      case 6:
        return 'dB/sec';
      case 7:
        return 'cm/sec';
      case 8:
        return `cm${String.fromCharCode(178)}`;
      case 9:
        return `cm${String.fromCharCode(178)}/sec`;
      case 10:
        return `cm${String.fromCharCode(179)}`;
      case 11:
        return `cm${String.fromCharCode(179)}/sec`;
      case 12:
        return '\u00B0';
    }

    return 'pixels';
  }
}

export const getUltrasoundRegions = image => {
  const sequenceOfUltrasoundRegions =
    image && image.data && image.data.elements && image.data.elements.x00186011;
  const ultrasoundRegions =
    sequenceOfUltrasoundRegions &&
    sequenceOfUltrasoundRegions.items.length > 0 &&
    sequenceOfUltrasoundRegions.items.map(
      item => new UltrasoundRegion(item.dataSet)
    );

  return ultrasoundRegions || [];
};
