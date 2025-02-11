export const PermissionStatus = {
    GRANTED: 'granted',
    DENIED: 'denied'
};

export const requestForegroundPermissionsAsync = jest.fn().mockResolvedValue({
    status: PermissionStatus.GRANTED
});

export const getCurrentPositionAsync = jest.fn().mockResolvedValue({
    coords: {
        latitude: 45.4965,
        longitude: -73.5780,
        accuracy: 5
    }
});
