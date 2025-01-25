import React from 'react';
import {NavigationContainer } from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import LoginScreen from '../screens/LoginScreen';



const DrawerNavigator = () => { 

    const Drawer = createDrawerNavigator();

    return ( 
    
            <Drawer.Navigator> 
                <Drawer.Screen name="Home" component={HomeScreen} /> 
                <Drawer.Screen name= "Map" component={MapScreen} /> 
                <Drawer.Screen name= "Login" component={LoginScreen} /> 
            </Drawer.Navigator>
        
    )
}

export default DrawerNavigator;