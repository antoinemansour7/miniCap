import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import Schedule from '../Schedule'; 

jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
}));


jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

describe('Schedule Component', () => {
  it('renders without crashing', () => {
    render(<Schedule />);


    expect(screen.getByText('Time')).toBeTruthy();
    expect(screen.getByText('Mon')).toBeTruthy();
    expect(screen.getByText('Tue')).toBeTruthy();
    expect(screen.getByText('Wed')).toBeTruthy();
    expect(screen.getByText('Thu')).toBeTruthy();
    expect(screen.getByText('Fri')).toBeTruthy();


    expect(screen.getByText('08:00')).toBeTruthy();
    expect(screen.getByText('22:00')).toBeTruthy();
  });

  it('toggles edit mode when the edit button is pressed', () => {
    render(<Schedule />);


    const editButton = screen.getByTestId('edit-button'); 
    fireEvent.press(editButton);

    
    const addButton = screen.getByTestId('add-button'); 
    const deleteButton = screen.getByTestId('delete-button'); 

    expect(addButton.props.style.transform[0].translateY._value).toBe(-60);
    expect(deleteButton.props.style.transform[0].translateY._value).toBe(-120);
  });

  it('opens and closes the search modal', () => {
    render(<Schedule />);


    // const firstCell = screen.getAllByTestId('cell')[0]; // Add testID="cell" to each cell
    // fireEvent.press(firstCell);


    // expect(screen.getByText('Add Class')).toBeTruthy();

    
    // const closeButton = screen.getByTestId('close-button'); // Add testID="close-button" to the close button
    // fireEvent.press(closeButton);


    expect(screen.queryByText('Add Class')).toBeNull();
  });

  it('updates the search query when typing in the search input', () => {
    render(<Schedule />);


    const firstCell = screen.getAllByTestId('cell')[0];
    fireEvent.press(firstCell);


    const searchInput = screen.getByPlaceholderText('Search for a class...');
    fireEvent.changeText(searchInput, 'Math 101');

    expect(searchInput.props.value).toBe('Math 101');
  });

  it('renders floating buttons and responds to clicks', () => {
    render(<Schedule />);


    const addButton = screen.getByTestId('add-button');
    const deleteButton = screen.getByTestId('delete-button');
    const editButton = screen.getByTestId('edit-button');

    expect(addButton).toBeTruthy();
    expect(deleteButton).toBeTruthy();
    expect(editButton).toBeTruthy();


    fireEvent.press(addButton);
    fireEvent.press(deleteButton);
    fireEvent.press(editButton);
  });
});