import getTool from '../../store/getTool.js';

export default function (element, name) {
  const tool = getTool(element, name);

  return tool.mode === 'active';
}
