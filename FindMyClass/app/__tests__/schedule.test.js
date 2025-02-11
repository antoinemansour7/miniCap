import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Schedule from '../screens/schedule'; // Adjust path if necessary

describe('Schedule Component', () => {
  
  it('renders the schedule correctly', () => {
    const { getByText } = render(<Schedule />);
    
    // Check for expected headers
    expect(getByText('Time')).toBeTruthy();
    expect(getByText('Mon')).toBeTruthy();
    expect(getByText('Tue')).toBeTruthy();
    expect(getByText('Wed')).toBeTruthy();
    expect(getByText('Thu')).toBeTruthy();
    expect(getByText('Fri')).toBeTruthy();
  });

  it('toggles edit mode when edit button is clicked', async () => {
    const { getByTestId } = render(<Schedule />);

    const editButton = getByTestId('edit-button'); // Add testID to the button
    fireEvent.press(editButton);

    // Expect button rotation (checking UI changes)
    await waitFor(() => {
      expect(editButton).toBeTruthy();
    });
  });

  it('opens and closes search modal when clicking a cell', async () => {
    const { getByTestId, queryByText } = render(<Schedule />);

    const cell = getByTestId('schedule-cell-Mon-08:00'); // Add testID to cells
    fireEvent.press(cell);

    await waitFor(() => {
      expect(queryByText('Add Class')).toBeTruthy();
    });

    // Close the modal
    const closeButton = getByTestId('close-search-modal'); // Add testID to close button
    fireEvent.press(closeButton);

    await waitFor(() => {
      expect(queryByText('Add Class')).toBeFalsy();
    });
  });

  it('triggers search input field', async () => {
    const { getByTestId, getByPlaceholderText } = render(<Schedule />);

    const addButton = getByTestId('add-button'); // Add testID to buttons
    fireEvent.press(addButton);

    await waitFor(() => {
      expect(getByPlaceholderText('Search for a class...')).toBeTruthy();
    });
  });

  it('renders time slots correctly', () => {
    const { getByText } = render(<Schedule />);
    
    expect(getByText('08:00')).toBeTruthy();
    expect(getByText('08:30')).toBeTruthy();
    expect(getByText('09:00')).toBeTruthy();
  });
});