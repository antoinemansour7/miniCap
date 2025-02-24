import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SearchBar from '../SearchBar';

describe('SearchBar Component', () => {
  const sampleData = [
    { id: '1', name: 'Alpha' },
    { id: '2', name: 'Beta' },
    { id: '3', name: 'Alaska' },
  ];

  it('calls onChangeText and displays filtered suggestions when text is typed', () => {
    const onChangeTextMock = jest.fn();
    const { getByTestId, getByText, queryByText } = render(
      <SearchBar value="" onChangeText={onChangeTextMock} data={sampleData} />
    );

    const input = getByTestId('search-input');
    // Type "Al" to filter suggestions (should match "Alpha" and "Alaska")
    fireEvent.changeText(input, 'Al');

    // Verify parent's onChangeText is called with the new text
    expect(onChangeTextMock).toHaveBeenCalledWith('Al');

    // Check that suggestions are rendered
    expect(getByText('Alpha (1)')).toBeTruthy();
    expect(getByText('Alaska (3)')).toBeTruthy();
    // "Beta" should not appear because it doesn't start with "Al"
    expect(queryByText('Beta (2)')).toBeNull();
  });

  it('clears suggestions when input text is empty', () => {
    const onChangeTextMock = jest.fn();
    const { getByTestId, queryByText } = render(
      <SearchBar value="" onChangeText={onChangeTextMock} data={sampleData} />
    );

    const input = getByTestId('search-input');
    // Create suggestions first
    fireEvent.changeText(input, 'Al');
    // Then clear the input text
    fireEvent.changeText(input, '');

    // No suggestions should be visible
    expect(queryByText('Alpha (1)')).toBeNull();
    expect(queryByText('Alaska (3)')).toBeNull();
  });

  it('updates text and calls onSelectItem when a suggestion is pressed', () => {
    const onChangeTextMock = jest.fn();
    const onSelectItemMock = jest.fn();
    const { getByTestId, getByText, queryByText } = render(
      <SearchBar
        value=""
        onChangeText={onChangeTextMock}
        data={sampleData}
        onSelectItem={onSelectItemMock}
      />
    );

    const input = getByTestId('search-input');
    fireEvent.changeText(input, 'Al');

    // Tap the suggestion "Alpha (1)"
    const suggestion = getByText('Alpha (1)');
    fireEvent.press(suggestion);

    // The parent's onChangeText should be updated with the selected item's name
    expect(onChangeTextMock).toHaveBeenCalledWith('Alpha');
    // onSelectItem callback should be called with the selected item
    expect(onSelectItemMock).toHaveBeenCalledWith({ id: '1', name: 'Alpha' });
    // Suggestions list should now be cleared
    expect(queryByText('Alpha (1)')).toBeNull();
    expect(queryByText('Alaska (3)')).toBeNull();
  });

  it('renders the provided placeholder text', () => {
    const onChangeTextMock = jest.fn();
    const customPlaceholder = 'Search for items...';
    const { getByPlaceholderText } = render(
      <SearchBar
        value=""
        onChangeText={onChangeTextMock}
        data={sampleData}
        placeholder={customPlaceholder}
      />
    );

    // Verify that the custom placeholder is rendered
    expect(getByPlaceholderText(customPlaceholder)).toBeTruthy();
  });

  // Additional coverage tests

  it('does not render suggestions container when no suggestions match', () => {
    const onChangeTextMock = jest.fn();
    const { getByTestId, queryByText } = render(
      <SearchBar value="" onChangeText={onChangeTextMock} data={sampleData} />
    );
    const input = getByTestId('search-input');
    fireEvent.changeText(input, 'Z'); // No item starts with "Z"
    expect(queryByText('Alpha (1)')).toBeNull();
    expect(queryByText('Beta (2)')).toBeNull();
    expect(queryByText('Alaska (3)')).toBeNull();
  });

  it('handles text with leading and trailing whitespace', () => {
    const onChangeTextMock = jest.fn();
    const { getByTestId, queryByText } = render(
      <SearchBar value="" onChangeText={onChangeTextMock} data={sampleData} />
    );
    const input = getByTestId('search-input');
    fireEvent.changeText(input, '  al  '); // Extra spaces
    // onChangeText is still called with the raw text
    expect(onChangeTextMock).toHaveBeenCalledWith('  al  ');
    // Since filtering uses the raw (untrimmed) input, no suggestions match "  al  "
    expect(queryByText('Alpha (1)')).toBeNull();
    expect(queryByText('Alaska (3)')).toBeNull();
  });

  it('handles selection gracefully when onSelectItem is undefined', () => {
    const onChangeTextMock = jest.fn();
    const { getByTestId, getByText, queryByText } = render(
      <SearchBar value="" onChangeText={onChangeTextMock} data={sampleData} />
    );
    const input = getByTestId('search-input');
    fireEvent.changeText(input, 'Al');
    // Tap the suggestion "Alaska (3)"
    const suggestion = getByText('Alaska (3)');
    fireEvent.press(suggestion);
    // onChangeText should update to the selected item's name
    expect(onChangeTextMock).toHaveBeenCalledWith('Alaska');
    // Suggestions should be cleared
    expect(queryByText('Alpha (1)')).toBeNull();
    expect(queryByText('Alaska (3)')).toBeNull();
  });

  it('does not display suggestions when only whitespace is entered', () => {
    const onChangeTextMock = jest.fn();
    const { getByTestId, queryByText } = render(
      <SearchBar value="" onChangeText={onChangeTextMock} data={sampleData} />
    );
    const input = getByTestId('search-input');
    fireEvent.changeText(input, '   ');
    // onChangeText is called with the whitespace text
    expect(onChangeTextMock).toHaveBeenCalledWith('   ');
    // Since trimmed text is empty, no suggestions should appear
    expect(queryByText('Alpha (1)')).toBeNull();
    expect(queryByText('Beta (2)')).toBeNull();
    expect(queryByText('Alaska (3)')).toBeNull();
  });
});
