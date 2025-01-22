export const NativeModulesProxy = {
  ExponentDevice: {
    getPlatformName: () => 'ios',
  },
};

export const EventEmitter = {
  setNativeEventEmitter: () => {},
};

export const Refs = {
  get: () => null,
  set: () => {},
  remove: () => {},
};
