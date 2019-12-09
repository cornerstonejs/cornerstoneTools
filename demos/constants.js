export const ModalType = {
  ACTION: 'action',
  CONFIRM: 'confirm',
};

export const VesselEditState = {
  NONE_EDIT: 0,
  EDITED: 1,
  EDITING: 2,
};

export const PaneTypes = {
  IMAGE: 1,
  EXPORT: 2, // 预留给Cypress
  ANNOTATION: 3, // 预留给Cypress
  PRINT: 4,
};

export const WindowLevelValue = {
  VALUE_MAX: 9999,
  VALUE_MIN: -9999,
};

export const MOUSE_WHEEL_SCALE = 20;

export const UNKNOWN_VESSEL = 'unknown';
export const UNKNOWN_DISPLAY = '无命名血管';
export const SEGMENT = 'seg';

export const MESSAGE_TYPE = {
  PARSE_ERROR: 'parse_error',
  PARSE_SUCCESS: 'parse_success',
};

export const VESSEL_DISPLAY_MODE = {
  FULL: 0,
  SIMPLE: 1,
};

export const VESSEL_DISPLAY_MODE_TEXT = ['完整模式', '精简模式'];

export const DICOM_TYPE = {
  ORIGIN: 'slices',
  VR: 'vr',
  VR_MYO: 'vr_myo',
  VR_MIP: 'vr_mip',
  CPR: 'cpr',
  AXIS: 'shortaxis',
  STRAIGHT: 'straight',
};

export const DICOM_TYPE_INDEX = {
  ORIGIN_SERIES: 1,
  CPR_SERIES: 2,
  LUMEN_SERIES: 4,
  XSECTION_SERIES: 5,
  VR_SERIES: 3,
  VR_SERIES_MYO: 6,
  VR_SERIES_MIP: 7,
};

export const SNAME_TYPE_MAP = {
  1: DICOM_TYPE.ORIGIN,
  2: DICOM_TYPE.CPR,
  3: DICOM_TYPE.VR,
  6: DICOM_TYPE.VR_MYO,
  7: DICOM_TYPE.VR_MIP,
  4: DICOM_TYPE.STRAIGHT,
  5: DICOM_TYPE.AXIS,
};

export const DICOM_STATE = {
  UNLOAD: 0,
  LOADING: 1,
  COMPLETE: 2,
  ERROR: 3,
};

export const defaultLayout = [1, 1, 1, 1, 1, 1]; // 0隐藏，1普通，2最大化

export const ReservedLayout = [
  {id: 0, text: '3x2', data: [3, 2]},
  {id: 1, text: '3x3', data: [3, 3]},
  {id: 2, text: '3x4', data: [3, 4]},
  {id: 3, text: '3x5', data: [3, 5]},
  {id: 4, text: '3x6', data: [3, 6]},
  {id: 5, text: '4x1', data: [4, 1]},
  {id: 6, text: '4x2', data: [4, 2]},
  {id: 7, text: '4x3', data: [4, 3]},
  {id: 8, text: '4x4', data: [4, 4]},
  {id: 9, text: '4x5', data: [4, 5]},
  {id: 10, text: '4x6', data: [4, 6]},
  {id: 11, text: '5x3', data: [5, 3]},
  {id: 12, text: '5x4', data: [5, 4]},
  {id: 13, text: '5x5', data: [5, 5]},
  {id: 14, text: '5x6', data: [5, 6]},
  {id: 15, text: '5x7', data: [5, 7]},
  {id: 16, text: '6x2', data: [6, 2]},
  {id: 17, text: '6x3', data: [6, 3]},
  {id: 18, text: '6x4', data: [6, 4]},
  {id: 19, text: '6x5', data: [6, 5]},
  {id: 20, text: '6x6', data: [6, 6]},
  {id: 21, text: '7x5', data: [7, 5]},
  {id: 22, text: '7x6', data: [7, 6]},
  {id: 23, text: '7x7', data: [7, 7]},
  {id: 24, text: '7x8', data: [7, 8]},
  {id: 25, text: '自定义布局'},
];

export const VR_SERIAL = ['VR', 'STD_MYO', 'STD', 'MIP'];

export const SETTING_KEY = {
  PRINTER_SETTING: 'printer_settings',
  FILM_SETTING: 'film_settings',
  PUSH_SETTING: 'push_settings',
  PRINT_FORMAT_SETTING: 'print_format_settings',
  VR_SETTING: 'vr_settings',
  DIAGNOSIS_SETTING: 'diagnosis_settings',
  NAMING_SETTING: 'naming',
  REPORT_CONFIG: 'report_config',
  PRINTER_HABIT_SETTING: 'printer_habit_settings',
};

export const CaseState = {
  UPLOADING: 0,
  GENERATING: 1,
  GENERATED: 2,
  FIX: 3,
  ACCEPTED: 4,
  REJECTED: 5,
  EXCEPTION: 6,
  DISABLED: 7,
  RENAMING: 8,
  WRONG_CASE: 9,
  STOP_GENERATING: 10,
  QUEUEING: 11,
  IMPORTING: 12,
  DEL_AI_OUTPUT: 13,
  DEL_SLICE_SOURCE: 14,
};

export const disabledState = [
  CaseState.UPLOADING,
  CaseState.GENERATING,
  CaseState.RENAMING,
  CaseState.STOP_GENERATING,
  CaseState.QUEUEING,
  CaseState.IMPORTING,
  CaseState.DEL_AI_OUTPUT,
  CaseState.DEL_SLICE_SOURCE,
];

export const LAYOUT = {
  PANE_ORIGIN: 0,
  PANE_VR: 1,
  PANE_CPR: 2,
  PANE_CPR_ROTATION: 3,
  PANE_AXIS: 4,
  PANE_STRAIGHT: 5,
  PANE_NULL: -1,
};

export const CATEGORY = {
  GENERAL: 1,
  CPR: 2,
  STRAIGHT: 3,
  AXIS: 4,
  VR: 5,
};

export const appIssueItems = [
  '软件崩溃',
  '影像无法查看',
  'VR 影像错误',
  '曲面重建影像错误',
  '血管拉直影像错误',
  '冠脉探针影像错误',
  '其他',
];

export const NAME_DISPLAY = {
  VR_SHOW_DEFAULT: 1,
  VR_SHOW_THREE_BRANCH: 2,
  VR_SHOW_ALL: 3,
};

export const NAME_DISPLAY_DEFAULT = NAME_DISPLAY.VR_SHOW_THREE_BRANCH;

export const NAME_DISPLAY_PATH = [
  '',
  'path_novessel',
  'path',
  'path_allvessel',
];

export const defaultShortcuts = {
  left: [],
  right: [],
  up: [],
  down: [],
};

export const managementConst = {
  edit: 0,
  add: 1,
};

export const managementStatus = {
  0: '-',
  1: '成功',
  2: '失败',
  3: '进行中',
};

export const managementList = {
  push: 'push',
  print: 'print',
  user: 'user',
  iplist: 'iplist',
  system: 'system',
};

export const userRoles = {
  ADMIN: 10,
  USER: 20,
  REPORT_USER: 30,
  ADMIN_USER: 40,
};

export const AlgTask = {
  ALL: 'all',
  RENAME: 'rename',
  REPOSTPROCESS: 'repostprocess',
  RECOVERY: 'recovery',
};
