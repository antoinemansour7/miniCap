import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import Index from '../screens/index';

jest.mock('../../components/Card', () => {
  return ({ title, onPress }) => (
    <TouchableOpacity onPress={onPress} testID={`card-${title}`}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
});

describe('Index Screen', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <NavigationContainer>
        <Index />
      </NavigationContainer>
    );

    expect(getByText('SGW Map')).toBeTruthy();
    expect(getByText('LOY Map')).toBeTruthy();
    expect(getByText('Profile')).toBeTruthy();
  });

  it('navigates to correct screen when a card is pressed', () => {
    const mockNavigation = { navigate: jest.fn() };

    const { getByTestId } = render(
      <NavigationContainer>
        <Index />
      </NavigationContainer>
    );

    fireEvent.press(getByTestId('card-SGW Map'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('SGWMap');
  });
});