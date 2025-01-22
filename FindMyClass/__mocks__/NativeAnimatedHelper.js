const NativeAnimatedHelper = {
  API: {
    createAnimatedComponent: jest.fn(),
    Value: jest.fn(),
  },
  shouldUseNativeDriver: () => false,
  setWaitingForIdentifier: jest.fn(),
  unsetWaitingForIdentifier: jest.fn(),
};

module.exports = NativeAnimatedHelper;
