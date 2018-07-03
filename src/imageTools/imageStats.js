import displayTool from './displayTool.js';
import drawTextBox from '../util/drawTextBox.js';
import { getNewContext } from '../util/drawing.js';

function onImageRendered (e) {
  const eventData = e.detail;
  const image = eventData.image;
  const stats = image.stats;

  const context = getNewContext(eventData.canvasContext.canvas);

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
