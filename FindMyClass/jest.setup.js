import '@testing-library/jest-native/extend-expect';
<<<<<<< HEAD
import { expect } from '@testing-library/jest-native';
=======
import 'expect';
>>>>>>> 71aa560c3370c463add4a9a40ed475c5a783f07f

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
