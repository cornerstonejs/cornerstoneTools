export default function(toolData) {
  if (!toolData) {
    return;
  }

  for (let i = 0; i < toolData.data.length; i++) {
    const data = toolData.data[i];

    data.active = false;
    if (!data.handles) {
      continue;
    }

    deactivateAllHandles(data.handles);
  }
}

function deactivateAllHandles(handles) {
  Object.keys(handles).forEach(function(name) {
    const handle = handles[name];

    handle.active = false;
  });
}
