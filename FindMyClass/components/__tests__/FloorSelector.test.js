// FloorSelector.test.js
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import FloorSelector from '../FloorSelector';

// We create dummy styles to avoid issues with external style imports.
// (This is only needed if the styles in the component are causing test coverage issues.)
jest.mock('../BuildingMap', () => ({
  styles: {
    floorSelectorContainer: { padding: 10 },
    floorButton: { backgroundColor: 'gray' },
    selectedFloorButton: { backgroundColor: 'blue' },
    floorButtonText: { color: 'black' },
    selectedFloorButtonText: { color: 'white' },
  },
}));

// Use fake timers to control the setTimeout delay.
jest.useFakeTimers();

describe('FloorSelector Component (Hard-Coded Dummy Values)', () => {
  // Create dummy functions for setFloorNumber and setRenderTrigger.
  let dummySetFloorNumber;
  let dummySetRenderTrigger;
  const dummyFloorNumber = { H: 1, MB: 1, VL: 1 };

  beforeEach(() => {
    dummySetFloorNumber = jest.fn();
    dummySetRenderTrigger = jest.fn();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  test('should render hall building floor buttons and update on press', () => {
    const { getByText, queryByText } = render(
      <FloorSelector
        hallBuildingFocused={true}
        jmsbBuildingFocused={false}
        vanierBuildingFocused={false}
        setFloorNumber={dummySetFloorNumber}
        floorNumber={dummyFloorNumber}
        setRenderTrigger={dummySetRenderTrigger}
      />
    );

    // Verify hall floors 1, 2, 8, and 9 are rendered
    expect(getByText('1')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
    expect(getByText('8')).toBeTruthy();
    expect(getByText('9')).toBeTruthy();

    // Simulate press on floor "2" for hall building
    fireEvent.press(getByText('2'));
    expect(dummySetFloorNumber).toHaveBeenCalledWith({ ...dummyFloorNumber, H: 2 });
    // Simulate waiting 300ms
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(dummySetRenderTrigger).toHaveBeenCalledTimes(1);
  });

  test('should render jmsb building floor buttons and update on press', () => {
    const { getByText, queryByText } = render(
      <FloorSelector
        hallBuildingFocused={false}
        jmsbBuildingFocused={true}
        vanierBuildingFocused={false}
        setFloorNumber={dummySetFloorNumber}
        floorNumber={dummyFloorNumber}
        setRenderTrigger={dummySetRenderTrigger}
      />
    );

    // Verify JMSB floors 1 and 2 are rendered and hall-specific floors are not present
    expect(getByText('1')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
    expect(queryByText('8')).toBeNull();
    expect(queryByText('9')).toBeNull();

    // Simulate press on floor "2" for JMSB building
    fireEvent.press(getByText('2'));
    expect(dummySetFloorNumber).toHaveBeenCalledWith({ ...dummyFloorNumber, MB: 2 });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(dummySetRenderTrigger).toHaveBeenCalledTimes(1);
  });

  test('should render vanier building floor buttons and update on press', () => {
    const { getByText, queryByText } = render(
      <FloorSelector
        hallBuildingFocused={false}
        jmsbBuildingFocused={false}
        vanierBuildingFocused={true}
        setFloorNumber={dummySetFloorNumber}
        floorNumber={dummyFloorNumber}
        setRenderTrigger={dummySetRenderTrigger}
      />
    );

    // Verify Vanier floors 1 and 2 are rendered and hall-specific floors are not present
    expect(getByText('1')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
    expect(queryByText('8')).toBeNull();
    expect(queryByText('9')).toBeNull();

    // Simulate press on floor "2" for Vanier building
    fireEvent.press(getByText('2'));
    expect(dummySetFloorNumber).toHaveBeenCalledWith({ ...dummyFloorNumber, VL: 2 });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(dummySetRenderTrigger).toHaveBeenCalledTimes(1);
  });

  test('should render nothing when no building is focused', () => {
    const { queryByText } = render(
      <FloorSelector
        hallBuildingFocused={false}
        jmsbBuildingFocused={false}
        vanierBuildingFocused={false}
        setFloorNumber={dummySetFloorNumber}
        floorNumber={dummyFloorNumber}
        setRenderTrigger={dummySetRenderTrigger}
      />
    );
    // No floor buttons should be rendered.
    expect(queryByText('1')).toBeNull();
    expect(queryByText('2')).toBeNull();
    expect(queryByText('8')).toBeNull();
    expect(queryByText('9')).toBeNull();
  });

  test('should render all floor selectors when all building flags are true', () => {
    const { getAllByText } = render(
      <FloorSelector
        hallBuildingFocused={true}
        jmsbBuildingFocused={true}
        vanierBuildingFocused={true}
        setFloorNumber={dummySetFloorNumber}
        floorNumber={dummyFloorNumber}
        setRenderTrigger={dummySetRenderTrigger}
      />
    );
    // "1" and "2" should be rendered in all three selectors:
    const ones = getAllByText('1');
    const twos = getAllByText('2');
    expect(ones.length).toBe(3);
    expect(twos.length).toBe(3);
    // Additionally, hall building renders floors 8 and 9.
    expect(getAllByText('8').length).toBe(1);
    expect(getAllByText('9').length).toBe(1);
  });
});
