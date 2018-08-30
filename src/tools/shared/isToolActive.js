import getToolForElement from '../../store/getToolForElement.js';

export default function (element, name) {
  const tool = getToolForElement(element, name);

  return tool.mode === 'active';
}
