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



// Define paths to floor plan images/SVGs
const hallFloorPlans = {
    1: require('../floorPlans/Hall-1.png'),
    2: require('../floorPlans/Hall-2.png'),
    8: require('../floorPlans/Hall-8.png'),
    9: require('../floorPlans/Hall-9.png')
  };
  
  const jmsbFloorPlans = {
    1: require('../floorPlans/MB-1.png'),
    2: require('../floorPlans/MB-S2-1.png'),
  }
  
  const vanierFloorPlans = {
    1: require('../floorPlans/VL-1.png'),
    2: require('../floorPlans/VL-2-1.png')
  }
  
  const ccFloorPlan = require('../floorPlans/CC.png');
   


const FloorPlans = ({ 

    floorNumber,

 }) => {

   


    return (
        <>
             {hallBuilding && hallBounds && hallFloorPlans[floorNumber['H']] &&   (
                      <View 
                        //style={{opacity: zoomLevel <= 18 ? 0.5 : 1 }}
                      >
            
                        <Overlay 
                          bounds={[
                            [hallBounds.south, hallBounds.west],
                            [hallBounds.north, hallBounds.east]
                          ]}
                          image={hallFloorPlans[floorNumber['H']]}
                          zIndex={1}
                        />
                      </View> )}
            
                      {jmsbBuilding && jmsbBounds && jmsbFloorPlans[floorNumber['MB']] &&  (
                      <View 
                        //style={{opacity: zoomLevel <= 17.3 ? 0.5 : 1 }}
                      >
            
                        <Overlay 
                          bounds={[
                            [jmsbBounds.south, jmsbBounds.west],
                            [jmsbBounds.north, jmsbBounds.east]
                          ]}
                          image={jmsbFloorPlans[floorNumber['MB']]}
                          zIndex={1}
                        />
                      </View> )}
            
                      {vanierBuilding &&  vanierBounds && vanierFloorPlans[floorNumber['VL']] &&  (
                        <View
                         // style={{opacity: zoomLevel <= 17.3 ? 0.5 : 1 }}
                        >
            
                          <Overlay
                            bounds={[
                              [vanierBounds.south, vanierBounds.west],
                              [vanierBounds.north, vanierBounds.east]
                            ]}
                            image={vanierFloorPlans[floorNumber['VL']]}
                            zIndex={1}
                          />
                        </View>
                      )}
            
                      {ccBuilding && ccBounds && ccFloorPlan &&  (
                        <View
                          //style={{opacity: zoomLevel <= 17.3 ? 0.5 : 1 }}
                            >
                          <Overlay
                            bounds={[
                              [ccBounds.south, ccBounds.west],
                              [ccBounds.north, ccBounds.east]
                            ]}
                            image={ccFloorPlan}
                            zIndex={1} 
                            />
                            </View>
                      )}
            
        </>
    );
 }

export default FloorPlans;