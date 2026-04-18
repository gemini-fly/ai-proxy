// Stub for antd - peer dep of @lobehub/icons / antd-style, not actually used at runtime
const noop = () => {};
const empty = {};

export const theme = {
  useToken: () => ({ token: {}, theme: {}, hashId: '' }),
  defaultAlgorithm: noop,
  darkAlgorithm: noop,
  compactAlgorithm: noop,
  defaultSeed: {},
  getDesignToken: () => ({}),
};
export const ConfigProvider = noop;
export const Grid = { useBreakpoint: () => ({}) };
export const message = { info: noop, success: noop, error: noop, warning: noop, open: noop };
export const Modal = noop;
export const notification = { open: noop, info: noop, success: noop, error: noop };
export const version = '5.0.0';

export default {
  theme,
  ConfigProvider,
  Grid,
  message,
  Modal,
  notification,
  version,
};
