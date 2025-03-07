import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CustomModal from '../CustomModal';

describe('CustomModal', () => {
  const mockOnClose = jest.fn();
  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    type: 'success',
    title: 'Test Title',
    message: 'Test Message'
  };

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders correctly with success type', () => {
    const { getByText } = render(<CustomModal {...defaultProps} />);
    
    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('Test Message')).toBeTruthy();
    expect(getByText('OK')).toBeTruthy();
  });

  it('renders correctly with error type', () => {
    const { getByText } = render(
      <CustomModal {...defaultProps} type="error" title="Error Title" />
    );
    
    expect(getByText('Error Title')).toBeTruthy();
  });

  it('calls onClose when OK button is pressed', () => {
    const { getByText } = render(<CustomModal {...defaultProps} />);
    
    fireEvent.press(getByText('OK'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('uses default title when no title is provided', () => {
    const propsWithoutTitle = {
      ...defaultProps,
      title: undefined
    };
    
    const { getByText } = render(<CustomModal {...propsWithoutTitle} />);
    expect(getByText('Welcome!')).toBeTruthy();
  });

  it('shows error title by default for error type without title', () => {
    const propsWithoutTitle = {
      ...defaultProps,
      type: 'error',
      title: undefined
    };
    
    const { getByText } = render(<CustomModal {...propsWithoutTitle} />);
    expect(getByText('Error')).toBeTruthy();
  });

  it('is not visible when visible prop is false', () => {
    const { getByTestId } = render(
      <CustomModal {...defaultProps} visible={false} />
    );
    
    expect(() => getByTestId('modal-container')).toThrow();
  });
});
