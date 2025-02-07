import React from 'react';
import { render } from '@testing-library/react-native';
import Card from '../Card';
import Icon from 'react-native-vector-icons/Ionicons';

jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

describe('Card Component', () => {
  it('renders correctly with given props', () => {
    const { getByText, getByTestId } = render(<Card iconName="home" title="Home" />);

    // Check if the title is displayed
    expect(getByText('Home')).toBeTruthy();

    // Check if the icon is rendered
    expect(getByTestId('card-icon')).toBeTruthy();
  });

  it('matches snapshot', () => {
    const tree = render(<Card iconName="home" title="Home" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});