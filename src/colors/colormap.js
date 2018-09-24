
const COLOR_TRANSPARENT = [0, 0, 0, 0];

const colormapsData = {
  
};

/**
 * Return a colorMap object with the provided id and colormapData
 * if the Id matches existent colorMap objects (check colormapsData) the colormapData is ignored.
 * if the colormapData is not empty, the colorMap will be added to the colormapsData list. Otherwise, an empty colorMap object is returned.
 * @param {string} id The ID of the colormap
 * @param {Object} colormapData - An object that can contain a name, numColors, gama, segmentedData and/or colors
 * @returns {*} The Colormap Object
 * @memberof Colors
*/
export function getColormap (id, colormapData) {
  let colormap = colormapsData[id];

  if (!colormap) {
    colormap = colormapsData[id] = colormapData || {
      name: '',
      colors: []
    };
  }

  return {
    getId () {
      return id;
    },

    getColorSchemeName () {
      return colormap.name;
    },

    setColorSchemeName (name) {
      colormap.name = name;
    },

    getNumberOfColors () {
      return colormap.colors.length;
    },

    setNumberOfColors (numColors) {
      while (colormap.colors.length < numColors) {
        colormap.colors.push(COLOR_TRANSPARENT);
      }

      colormap.colors.length = numColors;
    },

    getColor (index) {
      if (this.isValidIndex(index)) {
        return colormap.colors[index];
      }

      return COLOR_TRANSPARENT;
    },

    getColorRepeating (index) {
      const numColors = colormap.colors.length;

      index = numColors ? index % numColors : 0;

      return this.getColor(index);
    },

    setColor (index, rgba) {
      if (this.isValidIndex(index)) {
        colormap.colors[index] = rgba;
      }
    },

    addColor (rgba) {
      colormap.colors.push(rgba);
    },

    insertColor (index, rgba) {
      if (this.isValidIndex(index)) {
        colormap.colors.splice(index, 1, rgba);
      }
    },

    removeColor (index) {
      if (this.isValidIndex(index)) {
        colormap.colors.splice(index, 1);
      }
    },

    clearColors () {
      colormap.colors = [];
    },

    isValidIndex (index) {
      return (index >= 0) && (index < colormap.colors.length);
    }
  };
}
