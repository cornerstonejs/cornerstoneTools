import { getModule } from '../../index';

export default function setRadius(newRadius) {
  const { configuration } = getModule('segmentation');

  configuration.radius = Math.min(
    Math.max(newRadius, configuration.minRadius),
    configuration.maxRadius
  );
}
