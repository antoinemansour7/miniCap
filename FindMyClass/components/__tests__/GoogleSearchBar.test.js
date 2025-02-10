// components/__tests__/GoogleSearchBar.test.js

import React from 'react';
import { render, act } from '@testing-library/react-native';
import GoogleSearchBar from '../GoogleSearchBar';

// --- MOCK the react-native-google-places-autocomplete component ---
// Instead of defining variables outside, we attach them to the global object.
jest.mock('react-native-google-places-autocomplete', () => {
  const React = require('react');
  return {
    GooglePlacesAutocomplete: React.forwardRef((props, ref) => {
      // Save the props on a global variable for inspection.
      global.googlePlacesProps = props;
      // Create a fresh jest.fn and attach it globally.
      global.mockSetAddressText = jest.fn();
      // Expose an imperative handle for the ref.
      React.useImperativeHandle(ref, () => ({
        setAddressText: global.mockSetAddressText,
      }));
      return null; // Our mock does not render any UI.
    }),
  };
});

// --- MOCK the secrets so googleAPIKey is defined ---
// Adjust the relative path so that it correctly resolves to project-root/app/secrets.js.
jest.mock('../../app/secrets', () => ({
  googleAPIKey: 'FAKE_API_KEY',
}));

describe('GoogleSearchBar', () => {
  beforeEach(() => {
    // Reset our global variables before each test.
    global.googlePlacesProps = null;
    if (global.mockSetAddressText) {
      global.mockSetAddressText.mockClear();
    }
  });

  it('renders correctly and passes the proper placeholder', () => {
    render(<GoogleSearchBar onLocationSelected={jest.fn()} />);
    expect(global.googlePlacesProps).not.toBeNull();
    expect(global.googlePlacesProps.placeholder).toBe("Search for a place");
  });

  it('calls setAddressText with the initialValue when provided', () => {
    const initialValue = "Test Address";
    render(<GoogleSearchBar onLocationSelected={jest.fn()} initialValue={initialValue} />);
    // Our useEffect in GoogleSearchBar should call setAddressText(initialValue)
    expect(global.mockSetAddressText).toHaveBeenCalledWith(initialValue);
  });

  it('calls onLocationSelected with proper parameters when onPress is triggered', () => {
    const onLocationSelectedMock = jest.fn();
    render(<GoogleSearchBar onLocationSelected={onLocationSelectedMock} />);
    
    // Simulate a press by calling the onPress prop captured in our global variable.
    const data = { description: "Test Place" };
    const details = { geometry: { location: { lat: 45.0, lng: -73.0 } } };
    act(() => {
      global.googlePlacesProps.onPress(data, details);
    });
    
    expect(onLocationSelectedMock).toHaveBeenCalledWith(
      { latitude: 45.0, longitude: -73.0 },
      "Test Place"
    );
  });
});