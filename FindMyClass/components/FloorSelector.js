import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, Modal, StyleSheet, Image } from 'react-native';
import { Overlay } from 'react-native-maps';
import { useRouter } from 'expo-router';
import mapStyles from './mapStyles';
import SearchBar from './SearchBar';
import BuildingMarker from './BuildingMarker';
import useLocationHandler from '../hooks/useLocationHandler';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { getExactCoordinates, getFloorNumber, getPolygonBounds, getClassCoordinates } from '../utils/indoorUtils';
import {jmsbBuilding,jmsbBounds, jmsbFlippedGrid } from "./rooms/JMSBBuildingRooms";
import { vanierBuilding ,vanierBounds, vanierFlippedGrid, gridVanier } from "./rooms/VanierBuildingRooms";
import { ccBuilding, ccBounds, ccFlippedGrid, gridCC } from "./rooms/CCBuildingRooms";
import { hallBuilding, hallBounds } from "./rooms/HallBuildingRooms";
import { googleAPIKey } from '../app/secrets';
import RoomMarker from './RoomMarker';
import { styles } from './BuildingMap';


const FloorSelector = ({
    hallBuildingFocused,
    hallSelectedFloor,
    setHallSelectedFloor,

    jmsbBuildingFocused,
    jmsbSelectedFloor,
    setJMSBSelectedFloor,

    vanierBuildingFocused,
    vanierSelectedFloor,
    setVanierSelectedFloor,

}) => {


    return (
        <> 
              {hallBuildingFocused && (
                <View style={styles.floorSelectorContainer}>
                  {[1, 2, 8, 9].map((floor) => (
                    <TouchableOpacity
                      key={floor}
                      style={[
                        styles.floorButton,
                        hallSelectedFloor === floor && styles.selectedFloorButton,
                      ]}
                      onPress={() => setHallSelectedFloor(floor)}
                    >
                      <Text 
                        style={[
                          styles.floorButtonText,
                          hallSelectedFloor === floor && styles.selectedFloorButtonText
                        ]}
                      >
                        {floor}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
        
              {jmsbBuildingFocused && (
                      <View style={styles.floorSelectorContainer}>
                        {[1, 2].map((floor) => (
                          <TouchableOpacity
                            key={floor}
                            style={[
                              styles.floorButton,
                              jmsbSelectedFloor === floor && styles.selectedFloorButton,
                            ]}
                            onPress={() => setJMSBSelectedFloor(floor)}
                          >
                            <Text 
                              style={[
                                styles.floorButtonText,
                                jmsbSelectedFloor === floor && styles.selectedFloorButtonText
                              ]}
                            >
                              {floor}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
        
              { vanierBuildingFocused && (
                <View style={styles.floorSelectorContainer}>
                  {[1, 2].map((floor) => (
                    <TouchableOpacity
                      key={floor}
                      style={[
                        styles.floorButton,
                        vanierSelectedFloor === floor && styles.selectedFloorButton,
                      ]}
                      onPress={() => setVanierSelectedFloor(floor)}
                    >
                      <Text 
                        style={[
                          styles.floorButtonText,
                          vanierSelectedFloor === floor && styles.selectedFloorButtonText
                        ]}
                      >
                        {floor}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
        </>
    );
}

export default FloorSelector;