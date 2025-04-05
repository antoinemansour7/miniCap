import React, { memo, useCallback, useRef, useEffect, useState } from 'react';
import { Marker, Callout, CalloutSubview, Polygon } from 'react-native-maps';
import { View, Text, StyleSheet, Alert } from 'react-native';
import {styles} from './BuildingMarker'


const CalloutContent = memo(
  ({ room, router, classroomCoordinates, markerRef }) => (
    <View style={styles.calloutContainer}>
      <Text style={styles.calloutTitle}>{room?.name}</Text>
      <View style={styles.buttonRow}>
        <CalloutSubview
          onPress={() => {
            markerRef?.current?.hideCallout();
            router.push({
              pathname: '/screens/directions',
              params: {
                destination: JSON.stringify({latitude: room.object.latitude, longitude: room.object.longitude}),
                buildingName: room.name,
                room: JSON.stringify(room), 
                roomCoordinates: JSON.stringify(classroomCoordinates),
              },
            });
          }}
          style={styles.buttonContainer}
        >
          <View style={styles.button}>
            <Text style={styles.buttonText}>Directions</Text>
          </View>
        </CalloutSubview>

      </View>
    </View>
  ),
 (prevProps, nextProps) => {
    if (!prevProps.room || !nextProps.room) return false;
    return prevProps.room.id === nextProps.room.id;
  }
);


const RoomMarker = ({classroomCoordinates, room, router }) => {
    const markerRef = useRef(null);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (room && classroomCoordinates) {
            setShouldRender(true);
        } else {
            setShouldRender(false);
        }
    }, [room, classroomCoordinates]);

    if (!shouldRender) return null;

    return (
        <>
        {/* Render the marker only if room and classroomCoordinates are available */}
        { shouldRender && (
            <Marker
            ref={markerRef}
            coordinate={classroomCoordinates}
            title={room?.name}
            pinColor='#912338'
            tracksViewChanges={false}  // Improves performance
        >
            <Callout>
                <CalloutContent
                    room={room}
                    router={router}
                    classroomCoordinates={classroomCoordinates}
                    markerRef={markerRef}
                />
            </Callout>
        </Marker>
        )}
        </>
        
        
    );
}

export default memo(RoomMarker); // Memoize the component to prevent unnecessary re-renders