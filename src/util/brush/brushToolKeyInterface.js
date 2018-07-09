import external from '../../externalModules.js';
import { brush } from '../../paintingTools/brush.js';
import { adaptiveBrush } from '../../paintingTools/adaptiveBrush.js';
import updateBrushDrawColor from './updateBrushDrawColor.js';
import clip from '../clip.js';

const brushToolKeyInterface = {
  onKeyDown,
};

export default brushToolKeyInterface;

function onKeyDown (e, toolType) {
  const eventData = e.detail;
  const configuration = getConfiguration(toolType);
  let imageNeedsUpdate = false;

  imageNeedsUpdate = changeToolSize(eventData, configuration) || imageNeedsUpdate;
  imageNeedsUpdate = changeSegmentation(eventData, configuration) || imageNeedsUpdate;

  if (imageNeedsUpdate) {
    // Force onImageRendered to fire
    external.cornerstone.updateImage(eventData.element);
  }
}

function getConfiguration (toolType) {
  if (toolType === 'brush') {
    return brush.getConfiguration();
  } else if (toolType === 'adaptiveBrush') {
    return adaptiveBrush.getConfiguration();
  }

  throw `unknown brushTool: \'${toolType}\'`;
}

function changeToolSize (eventData, configuration) {
  const keyCode = eventData.keyCode;
  let imageNeedsUpdate = false;

  if (keyCode === 109 || keyCode === 173) {
    decreaseRadius(configuration);
    imageNeedsUpdate = true;
  } else if (keyCode === 61 || keyCode === 107) {
    increaseRadius(configuration);
    imageNeedsUpdate = true;
  }

  return imageNeedsUpdate;
}

function changeSegmentation (eventData, configuration) {
  const keyCode = eventData.keyCode;
  let imageNeedsUpdate = false;

  if (keyCode === 219) {

    imageNeedsUpdate = true;
  } else if (keyCode === 221) {
    nextSegmentation(configuration);
    imageNeedsUpdate = true;
  }

  return imageNeedsUpdate;
}

function increaseRadius (configuration) {
  configuration.radius = clip(configuration.radius + 1, configuration.minRadius, configuration.maxRadius);
}

function decreaseRadius (configuration) {
  configuration.radius = clip(configuration.radius - 1, configuration.minRadius, configuration.maxRadius);
}

function nextSegmentation (configuration) {
  const numberOfColors = getNumberOfColors(configuration);

  configuration.draw += 1;

  if (configuration.draw === numberOfColors - 1) {
    configuration.draw = 0;
  }

  updateBrushDrawColor(configuration);
}

function previousSegmentation (configuration) {
  const numberOfColors = getNumberOfColors(configuration);

  configuration.draw -= 1;

  if (configuration.draw < 0) {
    configuration.draw = numberOfColors - 1;
  }

  updateBrushDrawColor(configuration);
}

function getNumberOfColors (brushToolConfig) {
  const colormap = external.cornerstone.colors.getColormap(brushToolConfig.colormapId);

  return colormap.getNumberOfColors();
}
