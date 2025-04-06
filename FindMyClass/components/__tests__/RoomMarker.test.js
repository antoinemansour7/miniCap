import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import RoomMarker from '../RoomMarker';


jest.mock('../BuildingMarker', () => ({
  styles: {
    calloutContainer: { padding: 10 },
    calloutTitle: { fontSize: 16 },
    buttonRow: { flexDirection: 'row' },
    buttonContainer: { margin: 5 },
    button: { padding: 5, backgroundColor: 'gray' },
    buttonText: { color: 'white' },
  },
}));


jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Marker: React.forwardRef((props, ref) => (
      <View ref={ref} {...props}>
        {props.children}
      </View>
    )),
    Callout: (props) => <View {...props}>{props.children}</View>,
    CalloutSubview: (props) => (
      <View
        testID="calloutSubview"
        onStartShouldSetResponder={() => true}
        onResponderRelease={props.onPress}
        {...props}
      >
        {props.children}
      </View>
    ),
    Polygon: (props) => <View {...props}>{props.children}</View>,
  };
});

describe('RoomMarker Component', () => {
  const dummyRoom = {
    id: 'room1',
    name: 'Room 1',
    object: {
      latitude: 10,
      longitude: 20,
    },
  };
  const dummyCoordinates = { latitude: 10, longitude: 20 };

  let dummyRouter;
  beforeEach(() => {
    dummyRouter = { push: jest.fn() };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Existing tests
  it('renders nothing if room is not provided', () => {
    const { toJSON } = render(
      <RoomMarker
        classroomCoordinates={dummyCoordinates}
        room={null}
        router={dummyRouter}
      />
    );
    expect(toJSON()).toBeNull();
  });

  it('renders nothing if classroomCoordinates is not provided', () => {
    const { toJSON } = render(
      <RoomMarker
        classroomCoordinates={null}
        room={dummyRoom}
        router={dummyRouter}
      />
    );
    expect(toJSON()).toBeNull();
  });

  it('renders Marker and CalloutContent when room and classroomCoordinates are provided', () => {
    const { getByText, getByTestId } = render(
      <RoomMarker
        classroomCoordinates={dummyCoordinates}
        room={dummyRoom}
        router={dummyRouter}
      />
    );
    // The room name should be rendered in the callout.
    expect(getByText('Room 1')).toBeTruthy();
    // The Directions button should be rendered.
    expect(getByText('Directions')).toBeTruthy();
    // Verify that our callout subview is rendered.
    expect(getByTestId('calloutSubview')).toBeTruthy();
  });

  it('calls router.push with correct params when Directions is pressed', () => {
    const { getByTestId } = render(
      <RoomMarker
        classroomCoordinates={dummyCoordinates}
        room={dummyRoom}
        router={dummyRouter}
      />
    );

    // Retrieve the callout subview by its testID and simulate the responderRelease event.
    const calloutSubview = getByTestId('calloutSubview');
    fireEvent(calloutSubview, 'responderRelease');

    expect(dummyRouter.push).toHaveBeenCalledTimes(1);
    expect(dummyRouter.push).toHaveBeenCalledWith({
      pathname: '/screens/directions',
      params: {
        destination: JSON.stringify({
          latitude: dummyRoom.object.latitude,
          longitude: dummyRoom.object.longitude,
        }),
        buildingName: dummyRoom.name,
        room: JSON.stringify(dummyRoom),
        roomCoordinates: JSON.stringify(dummyCoordinates),
      },
    });
  });


  it('updates component rendering when props change', () => {
    const { queryByText, rerender } = render(
      <RoomMarker
        classroomCoordinates={dummyCoordinates}
        room={dummyRoom}
        router={dummyRouter}
      />
    );
    // Initially, it should render the room name.
    expect(queryByText('Room 1')).toBeTruthy();
    // Update with a null room; component should render nothing.
    rerender(
      <RoomMarker
        classroomCoordinates={dummyCoordinates}
        room={null}
        router={dummyRouter}
      />
    );
    expect(queryByText('Room 1')).toBeNull();
    // Revert back to a valid room.
    rerender(
      <RoomMarker
        classroomCoordinates={dummyCoordinates}
        room={dummyRoom}
        router={dummyRouter}
      />
    );
    expect(queryByText('Room 1')).toBeTruthy();
  });

  it('does not update CalloutContent when room id remains the same (memo comparator branch)', () => {
    const { getByText, rerender } = render(
      <RoomMarker
        classroomCoordinates={dummyCoordinates}
        room={dummyRoom}
        router={dummyRouter}
      />
    );
    // Re-render with a new room object with the same id but a different name.
    const updatedRoomSameId = { ...dummyRoom, name: 'Updated Room 1' };
    rerender(
      <RoomMarker
        classroomCoordinates={dummyCoordinates}
        room={updatedRoomSameId}
        router={dummyRouter}
      />
    );
    // Expect that the displayed room name remains unchanged (still "Room 1")
    // because the memo comparator returns true when the room id is the same.
    expect(getByText('Room 1')).toBeTruthy();
    expect(() => getByText('Updated Room 1')).toThrow();
  });

  it('updates CalloutContent when room id changes (memo comparator branch)', () => {
    const { getByText, rerender } = render(
      <RoomMarker
        classroomCoordinates={dummyCoordinates}
        room={dummyRoom}
        router={dummyRouter}
      />
    );
    // Re-render with a room object with a different id.
    const newRoom = {
      id: 'room2',
      name: 'Room 2',
      object: { latitude: 30, longitude: 40 },
    };
    rerender(
      <RoomMarker
        classroomCoordinates={dummyCoordinates}
        room={newRoom}
        router={dummyRouter}
      />
    );
    // The new room name should be rendered.
    expect(getByText('Room 2')).toBeTruthy();
  });

  it('calls hideCallout if markerRef is available when Directions is pressed', () => {
    // Override useRef for this test to simulate a markerRef with a hideCallout function.
    const fakeHideCallout = jest.fn();
    const useRefSpy = jest.spyOn(React, 'useRef').mockReturnValue({
      current: { hideCallout: fakeHideCallout },
    });

    const { getByTestId } = render(
      <RoomMarker
        classroomCoordinates={dummyCoordinates}
        room={dummyRoom}
        router={dummyRouter}
      />
    );

    const calloutSubview = getByTestId('calloutSubview');
    fireEvent(calloutSubview, 'responderRelease');

    expect(fakeHideCallout).toHaveBeenCalled();
    useRefSpy.mockRestore();
  });
});
