import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CustomErrorModal from '../CustomErrorModal';

describe('CustomErrorModal', () => {
  it('renders correctly when visible', () => {
    const message = 'Test error message';
    const onClose = jest.fn();
    const { getByText } = render(
      <CustomErrorModal visible={true} message={message} onClose={onClose} />
    );

    expect(getByText('Oops!')).toBeTruthy();
    expect(getByText(message)).toBeTruthy();
    expect(getByText('Got it')).toBeTruthy();
  });

  it('does not render when not visible', () => {
    const message = 'Test error message';
    const onClose = jest.fn();
    const { queryByText } = render(
      <CustomErrorModal visible={false} message={message} onClose={onClose} />
    );

    expect(queryByText('Oops!')).toBeNull();
  });

  it('calls onClose when button is pressed', () => {
    const message = 'Test error message';
    const onClose = jest.fn();
    const { getByText } = render(
      <CustomErrorModal visible={true} message={message} onClose={onClose} />
    );

    fireEvent.press(getByText('Got it'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
