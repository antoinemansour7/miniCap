// app/index.js
import React from 'react';
import { StyleSheet } from 'react-native';
import ToggleCampusMap from './components/ToggleCampusMap';

const Index = () => {
    return <ToggleCampusMap />;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default Index;
