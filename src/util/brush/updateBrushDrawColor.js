import external from '../../externalModules.js';

export default function (configuration) {
  const colormap = external.cornerstone.colors.getColormap(configuration.colormapId);
  const colorArray = colormap.getColor(configuration.draw);

  configuration.hoverColor = `rgba(${colorArray[[0]]}, ${colorArray[[1]]}, ${colorArray[[2]]}, 1.0 )`;
  configuration.dragColor = `rgba(${colorArray[[0]]}, ${colorArray[[1]]}, ${colorArray[[2]]}, 0.8 )`;
}
