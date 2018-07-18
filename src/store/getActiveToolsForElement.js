export default function (element, tools) {
  return tools.filter(
    (tool) => tool.element === element && tool.mode === 'active'
  );
}
