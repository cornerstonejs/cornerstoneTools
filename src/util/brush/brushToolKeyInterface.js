import external from '../../externalModules.js';
import updateBrushDrawColor from './updateBrushDrawColor.js';
import clip from '../clip.js';

const brushToolKeyInterface = {
  onKeyDown
};

export default brushToolKeyInterface;

function onKeyDown (e, brushToolConfig) {
  const eventData = e.detail;
  let imageNeedsUpdate = false;

  imageNeedsUpdate = changeToolSize(eventData, brushToolConfig) || imageNeedsUpdate;
  imageNeedsUpdate = changeSegmentation(eventData, brushToolConfig) || imageNeedsUpdate;

  if (imageNeedsUpdate) {
    // Force onImageRendered to fire
    external.cornerstone.updateImage(eventData.element);
  }
}

function changeToolSize (eventData, configuration) {
  const keyCode = eventData.keyCode;
  let imageNeedsUpdate = false;

  if (keyCode === 109 || keyCode === 173) {
    configuration.radius = clip(configuration.radius - 1, configuration.minRadius, configuration.maxRadius);
    imageNeedsUpdate = true;
  } else if (keyCode === 61 || keyCode === 107) {
    configuration.radius = clip(configuration.radius + 1, configuration.minRadius, configuration.maxRadius);
    imageNeedsUpdate = true;
  }

  return imageNeedsUpdate;
}

function changeSegmentation (eventData, configuration) {
  const keyCode = eventData.keyCode;
  let imageNeedsUpdate = false;

  if (keyCode === 219) {
    const numberOfColors = getNumberOfColors(configuration);

    configuration.draw -= 1;

    if (configuration.draw < 0) {
      configuration.draw = numberOfColors - 1;
    }

    updateBrushDrawColor(configuration);
    imageNeedsUpdate = true;
  } else if (keyCode === 221) {
    const numberOfColors = getNumberOfColors(configuration);

    configuration.draw += 1;

    if (configuration.draw === numberOfColors - 1) {
      configuration.draw = 0;
    }

    updateBrushDrawColor(configuration);
    imageNeedsUpdate = true;
  }

  return imageNeedsUpdate;
}

function getNumberOfColors (brushToolConfig) {
  const colormap = external.cornerstone.colors.getColormap(brushToolConfig.colormapId);

  return colormap.getNumberOfColors();
}
