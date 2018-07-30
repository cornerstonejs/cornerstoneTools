import { getters } from './../../store/index.js';

export default function (evt) {
  const eventData = evt.detail;
  const element = eventData.element;

  const toolsToRender = getters.
    mouseTools().
    filter(
      (tool) =>
        tool.element === element &&
        (tool.mode === 'active' ||
          tool.mode === 'passive' ||
          tool.mode === 'enabled')
    );

  toolsToRender.forEach((tool) => {
    if (tool.renderToolData) {
      tool.renderToolData(evt);
    }
  });
}
