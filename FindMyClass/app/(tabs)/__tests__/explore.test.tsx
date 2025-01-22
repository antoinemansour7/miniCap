
import React from 'react';
import { render } from '@testing-library/react-native';
import TabTwoScreen from '../explore';

describe('TabTwoScreen', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(<TabTwoScreen />);
    // Add your test assertions here
  });
});