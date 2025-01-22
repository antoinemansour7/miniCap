import Refs from './src/Refs';
import * as web from './src/web/index.web';

export { default as Refs } from './src/Refs';
export * from './src/web/index.web';

export const NativeModulesProxy = {
  ExponentDevice: {
    getPlatformName: () => 'ios',
  },
};

export const EventEmitter = {
  setNativeEventEmitter: () => {},
};
