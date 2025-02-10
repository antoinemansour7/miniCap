import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import SGWBuildings from './SGWBuildings';
import {useRouter} from 'expo-router';

const SGWMap = ({ searchText }) => {
    const mapRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        if (searchText) {
            const building = SGWBuildings.find((b) =>
                b.name.toLowerCase().includes(searchText.toLowerCase())
            );
            if (building && mapRef.current) {
                mapRef.current.animateToRegion({
                    latitude: building.latitude,
                    longitude: building.longitude,
                    latitudeDelta: 0.001, // Zoom level
                    longitudeDelta: 0.001,
                });
            }
        }
    }, [searchText]);

    const buildingColors = {
        H: { stroke: 'rgba(255, 204, 0, 0.8)', fill: 'rgba(255, 204, 0, 0.4)' },
        MB: { stroke: 'rgba(0, 204, 255, 0.8)', fill: 'rgba(0, 204, 255, 0.4)' },
        FT: { stroke: 'rgba(255, 102, 0, 0.8)', fill: 'rgba(255, 102, 0, 0.4)' },
        WL: { stroke: 'rgba(102, 204, 0, 0.8)', fill: 'rgba(102, 204, 0, 0.4)' },
        CL: { stroke: 'rgba(204, 0, 204, 0.8)', fill: 'rgba(204, 0, 204, 0.4)' },
        FG: { stroke: 'rgba(153, 51, 255, 0.8)', fill: 'rgba(153, 51, 255, 0.4)' },
        EV: { stroke: 'rgba(0, 102, 204, 0.8)', fill: 'rgba(0, 102, 204, 0.4)' },
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: 45.4965,
                    longitude: -73.5780,
                    latitudeDelta: 0.002,
                    longitudeDelta: 0.002,
                }}
            >
                {SGWBuildings.map((building) => (
                    <React.Fragment key={building.id}>
                        <Marker
                            coordinate={{
                                latitude: building.latitude,
                                longitude: building.longitude,
                            }}
                            title={building.name}
                            description={`Building ID: ${building.id}`}
                            onPress={() => 
                                {
                                console.log("Navigation to directions:", building.name);
                                 router.push({
                                    pathname: "/screens/directions",  
                                    params: {

                                        destination: JSON.stringify({
                                            latitude: building.latitude,
                                            longitude: building.longitude,
                                        }),
                                        buildingName: building.name,
                                    }
                                })}
                            }
                        />
                        {building.boundary && (
                            <Polygon
                                coordinates={building.boundary}
                                strokeColor={
                                    buildingColors[building.id]?.stroke || 'rgba(0, 0, 0, 0.8)'
                                }
                                fillColor={
                                    buildingColors[building.id]?.fill || 'rgba(0, 0, 0, 0.4)'
                                }
                                strokeWidth={2}
                            />
                        )}
                    </React.Fragment>
                ))}
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
});

export default SGWMap;