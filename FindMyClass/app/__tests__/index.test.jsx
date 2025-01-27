import React from 'react';
import { render, screen } from '@testing-library/react-native';
import Home from '../index';

describe('Home Component', () => {
  it('renders welcome message', () => {
    render(<Home />);
    const welcomeMessage = screen.getByText('Welcome to FindMyClass');
    expect(welcomeMessage).toBeTruthy();
  });
});