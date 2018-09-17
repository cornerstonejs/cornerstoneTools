import external from '../externalModules.js';

const state = {
  draw: 0,
  radius: 10,
  minRadius: 1,
  maxRadius: 50,
  alpha: 0.4,
  colorMapId: 'BrushColorMap',

  imageBitmapCache: {}
};

const mutations = {
  SET_DRAW_COLOR: (drawColorId) => {
    state.draw = drawColorId;
  },
  SET_RADIUS: (radius) => {
    state.radius = Math.min(
      Math.max(radius, state.minRadius),
      state.maxRadius
    );
  },
  SET_MIN_RADIUS: (minRadius) => {
    state.minRadius = minRadius;
  },
  SET_MAX_RADIUS: (maxRadius) => {
    state.maxRadius = maxRadius;
  },
  SET_ALPHA: (alpha) => {
    state.alpha = alpha;
  },

  /**
   * Sets the brush color map to something other than the default
   *
   * @param  {Array} colors An array of 4D [red, green, blue, alpha] arrays.
   */
  SET_BRUSH_COLOR_MAP: (colors) => {
    const colormap = external.cornerstone.colors.getColormap(state.colorMapId);

    colormap.setNumberOfColors(colors.length);

    for (let i = 0; i < colors.length; i++) {
      colormap.setColor(i, colors[i]);
    }
  },
  /*
  SET_ELEMENT_BRUSH_VISIBILITY: (enabledElementUID, segmentationIndex, visible = true) => {
    const
  },
  */
  SET_ELEMENT_IMAGE_BITMAP_CACHE: (enabledElementUID, segmentationIndex, imageBitmap) => {
    if (!state.imageBitmapCache[enabledElementUID]) {
      state.imageBitmapCache[enabledElementUID] = [];
    }

    state.imageBitmapCache[enabledElementUID][segmentationIndex] = imageBitmap;
  },
  CLEAR_ELEMENT_IMAGE_BITMAP_CACHE: (enabledElementUID) => {
    state.imageBitmapCache[enabledElementUID] = [];
  }

};

const getters = {
  draw: () => state.draw,
  radius: () => state.radius,
  minRadius: () => state.minRadius,
  maxRadius: () => state.maxRadius,
  alpha: () => state.alpha,
  colorMapId: () => state.colorMapId,
  imageBitmapCacheForElement: (enabledElementUID, segmentationIndex) => {
    if (!state.imageBitmapCache[enabledElementUID]) {
      return null;
    }

    return state.imageBitmapCache[enabledElementUID][segmentationIndex];
  }
};

export default {
  state,
  getters,
  mutations
};

const DISTINCT_COLORS = [
  [230, 25, 75, 255],
  [60, 180, 175, 255],
  [255, 225, 25, 255],
  [0, 130, 200, 255],
  [245, 130, 48, 255],
  [145, 30, 180, 255],
  [70, 240, 240, 255],
  [240, 50, 230, 255],
  [210, 245, 60, 255],
  [250, 190, 190, 255],
  [0, 128, 128, 255],
  [230, 190, 255, 255],
  [170, 110, 40, 255],
  [255, 250, 200, 255],
  [128, 0, 0, 255],
  [170, 255, 195, 255],
  [128, 128, 0, 255],
  [255, 215, 180, 255],
  [0, 0, 128, 255]
];

// DEFAULT BRUSH COLOR MAP
if (external.cornerstone && external.cornerstone.colors) {
  const defaultSegmentationCount = 100;
  const colormap = external.cornerstone.colors.getColormap(state.colorMapId);

  colormap.setNumberOfColors(defaultSegmentationCount);

  /*
    19 Colors selected to be as distinct from each other as possible,
    and ordered such that between each index you make large jumps around the
    color wheel. If defaultSegmentationCount is greater than 19, generate a
    random linearly interperlated color between 2 colors.
  */
  for (let i = 0; i < defaultSegmentationCount; i++) {
    if (i < DISTINCT_COLORS.length) {
      colormap.setColor(i, DISTINCT_COLORS[i]);
    } else {
      colormap.setColor(i, generateInterpolatedColor());
    }
  }
}

function generateInterpolatedColor () {
  const randIndicies = [
    getRandomInt(DISTINCT_COLORS.length),
    getRandomInt(DISTINCT_COLORS.length)
  ];

  const fraction = Math.random();
  const interpolatedColor = [];

  for (let j = 0; j < 4; j++) {
    interpolatedColor.push(
      Math.floor(
        fraction * DISTINCT_COLORS[randIndicies[0]][j]
        + (1.0 - fraction) * DISTINCT_COLORS[randIndicies[1]][j]
      )
    );
  }

  return interpolatedColor;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
