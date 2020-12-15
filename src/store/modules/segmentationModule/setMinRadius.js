import { getModule } from '../../index';

export default function setMinRadius(newMinRadius) {
  const { configuration } = getModule('segmentation');

  configuration.minRadius = newMinRadius;
}
