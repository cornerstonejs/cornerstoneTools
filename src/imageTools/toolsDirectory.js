var cornerstoneTools = (function($, cornertone, cornerstoneTools) {

  "use strict";

  if (cornerstoneTools === undefined) {
    cornerstoneTools = {};
  }

  cornerstoneTools.toolsDirectory = {
    probe:         "probe",
    angleTool:     "angle",
    ellipticalRoi: "ellipticalRoi",
    lengthTool:    "length",
    rectangleRoi:  "rectangleRoi"
  }

  return cornerstoneTools;

}($, cornerstone, cornerstoneTools));
