import { state } from './index.js';
import getTool from './getTool.js';

export default function (element, name) {
  const tool = getTool(element, name);

  return tool.mode === 'active' ? true: false;
}
