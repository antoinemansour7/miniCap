import '@testing-library/jest-native/extend-expect';
import 'expect';

// Simplified reanimated mock
jest.mock('react-native-reanimated', () => ({
  default: {
    createAnimatedComponent: jest.fn(),
    Value: jest.fn(),
    event: jest.fn(),
    add: jest.fn(),
    eq: jest.fn(),
    set: jest.fn(),
    cond: jest.fn(),
    interpolate: jest.fn(),
    View: jest.fn(),
    Extrapolate: { CLAMP: jest.fn() },
    Transition: {
      Together: 'Together',
      Out: 'Out',
      In: 'In',
    },
  },
}));
