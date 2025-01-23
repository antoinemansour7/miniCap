import React from 'react';
import { render, screen } from '@testing-library/react-native';
import Index from '../index';

describe('Index Component', () => {
  it('does not render unexpected text', () => {
    render(<Index />);
    const unexpectedText = screen.queryByText('Unexpected Text');
    expect(unexpectedText).toBeNull(); // Ensures the text is not rendered
  });

  it('does not render a pattern that should not match', () => {
    render(<Index />);
    const patternMatch = screen.queryByText(/unexpected/i); // Case-insensitive regex
    expect(patternMatch).toBeNull(); // Ensures no match for the pattern
  });

  it('renders the correct text but not the incorrect one', () => {
    render(<Index />);
    const correctText = screen.getByText('Hi'); // Ensure 'Hi' exists
    expect(correctText).toBeTruthy();

    const incorrectText = screen.queryByText('Hello World');
    expect(incorrectText).toBeNull(); // Ensure 'Hello World' does not exist
  });
});