import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Index from '../screens/index';
import Card from '../../components/Card';

// Mock the navigation hook
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock the Card component
jest.mock('../../components/Card', () => {
  return ({ title, onPress }) => (
    <div 
      testID={`card-${title.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={onPress}
    >
      {title}
    </div>
  );
});

describe('Index Screen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders the title correctly', () => {
    const { getByText } = render(<Index />);
    expect(getByText('Campus Map')).toBeTruthy();
  });

  it('renders correct number of rows', () => {
    const { UNSAFE_getAllByType } = render(<Index />);
    
    const rows = UNSAFE_getAllByType('View').filter(
      view => view.props.style?.flexDirection === 'row'
    );
    
    expect(rows).toHaveLength(4); 
  });

  it('renders correct number of cards', () => {
    const { getByTestId } = render(<Index />);
    
    const cardTitles = ['SGW Map', 'LOY Map', 'Profile', 'Settings', 'My Schedule', 'Security'];
    cardTitles.forEach(title => {
      expect(getByTestId(`card-${title.toLowerCase().replace(/\s+/g, '-')}`)).toBeTruthy();
    });
  });

  it('navigates to SGW Map when SGW Map card is pressed', () => {
    const { getByTestId } = render(<Index />);
    
    const sgwMapCard = getByTestId('card-sgw-map');
    fireEvent.press(sgwMapCard);
    
    expect(mockNavigate).toHaveBeenCalledWith('screens/map', { campus: 'SGW' });
  });

  it('navigates to Loyola Map when LOY Map card is pressed', () => {
    const { getByTestId } = render(<Index />);
    
    const loyMapCard = getByTestId('card-loy-map');
    fireEvent.press(loyMapCard);
    
    expect(mockNavigate).toHaveBeenCalledWith('screens/map', { campus: 'Loyola' });
  });

  it('navigates to Profile when Profile card is pressed', () => {
    const { getByTestId } = render(<Index />);
    
    const profileCard = getByTestId('card-profile');
    fireEvent.press(profileCard);
    
    expect(mockNavigate).toHaveBeenCalledWith('screens/profile');
  });

  it('navigates to My Schedule when My Schedule card is pressed', () => {
    const { getByTestId } = render(<Index />);
    
    const scheduleCard = getByTestId('card-my-schedule');
    fireEvent.press(scheduleCard);
    
    expect(mockNavigate).toHaveBeenCalledWith('screens/schedule');
  });

  it('does not navigate when clicking on non-navigational cards', () => {
    const { getByTestId } = render(<Index />);
    
    const settingsCard = getByTestId('card-settings');
    fireEvent.press(settingsCard);
    
    const securityCard = getByTestId('card-security');
    fireEvent.press(securityCard);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('applies correct styles to container', () => {
    const { UNSAFE_getByType } = render(<Index />);
    const container = UNSAFE_getByType('View');
    
    expect(container.props.style).toMatchObject({
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    });
  });

  it('applies correct styles to rows', () => {
    const { UNSAFE_getAllByType } = render(<Index />);
    
    const rows = UNSAFE_getAllByType('View').filter(
      view => view.props.style?.flexDirection === 'row'
    );

    rows.forEach(row => {
      expect(row.props.style).toMatchObject({
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        width: '100%',
      });
    });
  });
});