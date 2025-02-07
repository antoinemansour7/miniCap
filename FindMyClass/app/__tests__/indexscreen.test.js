import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Index from '../screens/index';
import Card from '../../components/Card';

// Mock the navigation hook
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate
  })
}));

// Mock the Card component
jest.mock('../../components/Card', () => {
  const MockCard = ({ iconName, title, onPress }) => {
    return (
      <div 
        testID={`card-${title.toLowerCase().replace(/\s+/g, '-')}`}
        onClick={onPress}
      >
        {title}
      </div>
    );
  };
  return MockCard;
});

describe('Index Screen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });


  it('navigates to SGW Map when SGW Map card is pressed', () => {
    const { getByTestId } = render(<Index />);
    
    const sgwMapCard = getByTestId('card-sgw-map');
    fireEvent.press(sgwMapCard);
    
    expect(mockNavigate).toHaveBeenCalledWith('SGWMap');
  });

  it('navigates to Loyola Map when LOY Map card is pressed', () => {
    const { getByTestId } = render(<Index />);
    
    const loyMapCard = getByTestId('card-loy-map');
    fireEvent.press(loyMapCard);
    
    expect(mockNavigate).toHaveBeenCalledWith('LoyolaMap');
  });

  it('renders correct number of rows', () => {
    const { UNSAFE_getAllByType } = render(<Index />);
    
    // Get all View components that represent rows
    const rows = UNSAFE_getAllByType('View').filter(
      view => view.props.style?.flexDirection === 'row'
    );
    
    expect(rows).toHaveLength(3);
  });

  it('renders correct number of cards', () => {
    const { UNSAFE_getAllByType } = render(<Index />);
    const cards = UNSAFE_getAllByType(Card);
    
    expect(cards).toHaveLength(6);
  });

  it('applies correct styles to container', () => {
    const { UNSAFE_getByType } = render(<Index />);
    const container = UNSAFE_getByType('View');
    
    expect(container.props.style).toMatchObject({
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20
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
        width: '100%'
      });
    });
  });
});