import displayTool from './displayTool.js';
import drawTextBox from '../util/drawTextBox.js';

function onImageRendered (e) {
  const eventData = e.detail;
  const image = eventData.image;
  const stats = image.stats;

  const context = eventData.canvasContext.canvas.getContext('2d');

  context.setTransform(1, 0, 0, 1, 0, 0);

  const textLines = [];

  Object.keys(stats).forEach(function (key) {
    const text = `${key} : ${stats[key]}`;

    textLines.push(text);
  });

  drawTextBox(context, textLines, 0, 0, 'orange');

  textLines.forEach(function (text) {
    console.log(text);
  });
}

const imageStats = displayTool(onImageRendered);

export default imageStats;
