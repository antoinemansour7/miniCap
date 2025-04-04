import React, { memo, useCallback, useRef } from 'react';
import { Marker, Callout, CalloutSubview, Polygon } from 'react-native-maps';
import { View, Text, StyleSheet, Alert } from 'react-native';
import {styles} from './BuildingMarker'


const CalloutContent = memo(
  ({ room, router, classroomCoordinates, markerRef }) => (
    <View style={styles.calloutContainer}>
      <Text style={styles.calloutTitle}>{room.name}</Text>
      <View style={styles.buttonRow}>
        <CalloutSubview
          onPress={() => {
            markerRef?.current?.hideCallout();
            router.push({
              pathname: '/screens/directions',
              params: {
                destination: JSON.stringify({latitude: room.object.latitude, longitude: room.object.longitude}),
                buildingName: room.name,
                room: room, 
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
  (prevProps, nextProps) => prevProps.room.id === nextProps.room.id
);


const RoomMarker = ({classroomCoordinates, room, router }) => {

      const markerRef = useRef(null);
    

    return (
        <>
        {room != null && (
             <Marker
                ref={markerRef}
                coordinate={classroomCoordinates}
                title={room.name}
                pinColor='#912338'
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

export default RoomMarker;