import { getModule } from '../../index';

export default function setMaxRadius(newMaxRadius) {
  const { configuration } = getModule('segmentation');

  configuration.maxRadius = newMaxRadius;
}
