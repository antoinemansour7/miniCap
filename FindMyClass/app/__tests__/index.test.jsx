import React from 'react';
import { render } from '@testing-library/react-native';
import Index from '../index';

describe('Index Component', () => {
  it('renders the welcome message correctly', () => {
    const { getByText } = render(<Index />);
    
  });
});