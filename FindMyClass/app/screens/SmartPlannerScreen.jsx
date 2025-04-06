// screens/SmartPlannerScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  FlatList,
  Image,
  Dimensions,
  Animated,
  StatusBar
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { generateSmartPlan } from '../api/smartPlannerService';
import SGWBuildings from '../../components/SGWBuildings';
import LoyolaBuildings from '../../components/loyolaBuildings';
import * as Location from 'expo-location';
import MapView, { Marker, Polyline } from 'react-native-maps';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const TASK_ITEM_HEIGHT = 70;
const CONCORDIA_BURGUNDY = '#912338';
const CONCORDIA_GOLD = '#EAAA00';

const SmartPlannerScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);
  const mapRef = useRef(null);
  
  // State management
  const [tasks, setTasks] = useState([
    { id: '1', description: '', completed: false }
  ]);
  const [currentTask, setCurrentTask] = useState('');
  const [loading, setLoading] = useState(false);
  const [campus, setCampus] = useState('SGW'); // Default to SGW campus
  const [currentLocation, setCurrentLocation] = useState(null);
  const [weatherData, setWeatherData] = useState({
    temperature: 20,
    conditions: 'Clear',
    precipitation: false
  });
  const [planResult, setPlanResult] = useState(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [mapRegion, setMapRegion] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [showMapFullscreen, setShowMapFullscreen] = useState(false);
  const [activeSegment, setActiveSegment] = useState(0);
  const [segmentDetails, setSegmentDetails] = useState([]);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const mapHeightAnim = useState(new Animated.Value(250))[0];
  const progressAnim = useState(new Animated.Value(0))[0];

  // Fetch location and weather on component mount
  // Add these constants at the top of the file, near other constants
const HALL_BUILDING_COORDINATES = {
  latitude: 45.497092,
  longitude: -73.579037
};

// Then modify the setupLocation function in the useEffect hook
useEffect(() => {
  const setupLocation = async () => {
    try {
      // Comment out or remove the actual location retrieval code
      /*
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need location permissions to optimize your route.');
        return;
      }
      
      setLocationPermission(true);
      
      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      */
      
      // Use mock location instead
      const { latitude, longitude } = HALL_BUILDING_COORDINATES;
      setLocationPermission(true); // Set this to true even though we're mocking
      
      setCurrentLocation({ latitude, longitude });
      
      // Set initial map region
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      
      // Since we know we're at SGW campus, we can hardcode this
      setCampus('SGW');
      
      // Fetch weather data with mock coordinates
      fetchWeatherData(latitude, longitude);
    } catch (error) {
      console.error('Error setting up location:', error);
      Alert.alert('Error', 'Failed to get location. Please try again.');
    }
  };
  
  setupLocation();
}, []);

  // Fetch weather data from a public API
  const fetchWeatherData = async (latitude, longitude) => {
    try {
      // Use the existing OpenWeatherMap API call
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=7d13191ace324073579f4c999586a05a&units=metric`
      );
      
      setWeatherData({
        temperature: response.data.main.temp,
        conditions: response.data.weather[0].main,
        precipitation: ['Rain', 'Snow', 'Drizzle', 'Thunderstorm'].includes(response.data.weather[0].main)
      });
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // Fallback to default values if API call fails
      setWeatherData({
        temperature: 18,
        conditions: 'Partly Cloudy',
        precipitation: false
      });
    }
  };

  // Add a new task to the list
  const addTask = () => {
    if (currentTask.trim() === '') return;
    
    const newTask = {
      id: Date.now().toString(),
      description: currentTask,
      completed: false
    };
    
    setTasks([...tasks, newTask]);
    setCurrentTask('');
  };

  // Remove a task from the list
  const removeTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  // Toggle between campuses
  const toggleCampus = () => {
    setCampus(campus === 'SGW' ? 'Loyola' : 'SGW');
  };

  // Select a segment
  const selectSegment = (index) => {
    setActiveSegment(index);
    
    // If we have building coordinates for this segment, focus map on it
    if (segmentDetails[index] && segmentDetails[index].building) {
      const { latitude, longitude } = segmentDetails[index].building;
      mapRef.current?.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 500);
    }
  };

  // Generate the smart plan
  const generatePlan = async () => {
    try {
      if (tasks.length === 0 || tasks.every(task => task.description.trim() === '')) {
        Alert.alert('Error', 'Please add at least one task.');
        return;
      }
      
      if (!currentLocation) {
        Alert.alert('Error', 'We need your location to optimize the route.');
        return;
      }
      
      setLoading(true);
      
      // Combine building data based on selected campus
      const allBuildings = campus === 'SGW' ? SGWBuildings : LoyolaBuildings;
      
      // Filter out empty tasks
      const nonEmptyTasks = tasks.filter(task => task.description.trim() !== '');
      
      // Generate the plan
      const result = await generateSmartPlan(
        nonEmptyTasks,
        currentLocation,
        allBuildings,
        weatherData,
        campus
      );
      
      setPlanResult(result);
      
      // Process segments for journey visualization
      const segments = [];
      if (result.steps && result.steps.length > 0) {
        result.steps.forEach((step, index) => {
          segments.push({
            id: `segment-${index}`,
            instruction: step.instruction,
            timeEstimate: step.timeEstimate || 5,
            distance: step.distance || 200,
            indoorPercentage: step.indoorPercentage || (weatherData.precipitation ? 70 : 30),
            building: step.building,
            fromBuilding: index > 0 ? result.steps[index - 1].building : null,
          });
        });
      }
      setSegmentDetails(segments);
      
      // Animate the appearance of the results
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true
        }),
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false
        })
      ]).start();
      
      // Generate route coordinates for the map
      if (result.steps && result.steps.length > 0) {
        const coordinates = [
          currentLocation, // Start with current location
          ...result.steps
            .filter(step => step.building) // Only include steps with associated buildings
            .map(step => ({
              latitude: step.building.latitude,
              longitude: step.building.longitude
            }))
        ];
        
        setRouteCoordinates(coordinates);
        
        // Adjust map region to show the route
        if (coordinates.length > 0) {
          // Calculate the bounding box for all coordinates
          const latitudes = coordinates.map(coord => coord.latitude);
          const longitudes = coordinates.map(coord => coord.longitude);
          
          const minLat = Math.min(...latitudes);
          const maxLat = Math.max(...latitudes);
          const minLng = Math.min(...longitudes);
          const maxLng = Math.max(...longitudes);
          
          // Add some padding
          const latDelta = (maxLat - minLat) * 1.5 || 0.01;
          const lngDelta = (maxLng - minLng) * 1.5 || 0.01;
          
          setMapRegion({
            latitude: (minLat + maxLat) / 2,
            longitude: (minLng + minLng) / 2,
            latitudeDelta: Math.max(latDelta, 0.01),
            longitudeDelta: Math.max(lngDelta, 0.01)
          });
        }
      }
      
      // Scroll to results
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 500);
      
    } catch (error) {
      console.error('Error generating plan:', error);
      Alert.alert('Error', 'Failed to generate plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get icon for weather condition
  const getWeatherIcon = () => {
    const condition = weatherData.conditions.toLowerCase();
    if (weatherData.precipitation) return 'rainy';
    if (condition.includes('cloud')) return 'partly-sunny';
    if (condition.includes('clear')) return 'sunny';
    if (condition.includes('sun')) return 'sunny';
    return 'partly-sunny'; // Default
  };

  // Render a task item
  const renderTaskItem = ({ item, index }) => (
    <Animated.View 
      style={[
        styles.taskItem,
        { 
          opacity: 1, 
          transform: [{ translateY: 0 }] 
        }
      ]}
    >
      <View style={styles.taskNumberCircle}>
        <Text style={styles.taskNumberText}>{index + 1}</Text>
      </View>
      <TextInput
        style={styles.taskInput}
        value={item.description}
        onChangeText={(text) => {
          const updatedTasks = tasks.map(task => 
            task.id === item.id ? { ...task, description: text } : task
          );
          setTasks(updatedTasks);
        }}
        placeholder="Enter task (e.g., borrow book from library)"
        placeholderTextColor="#999"
      />
      <TouchableOpacity onPress={() => removeTask(item.id)} style={styles.removeButton}>
        <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
      </TouchableOpacity>
    </Animated.View>
  );

  // Toggle full-screen map
  const toggleMapFullscreen = () => {
    setShowMapFullscreen(!showMapFullscreen);
    
    // Animate map height
    Animated.timing(mapHeightAnim, {
      toValue: showMapFullscreen ? 250 : height,
      duration: 300,
      useNativeDriver: false
    }).start();
  };

  // Get color based on indoor percentage
  const getIndoorPercentageColor = (percentage) => {
    if (percentage >= 80) return '#23A55A'; // Mostly indoor (green)
    if (percentage >= 40) return '#FFB302'; // Mixed (amber)
    return '#E11D48'; // Mostly outdoor (red)
  };

  // Render the map section
  const renderMap = () => {
    if (!mapRegion) return null;
    
    return (
      <Animated.View style={[
        styles.mapContainer,
        showMapFullscreen && styles.fullscreenMapContainer,
        { height: mapHeightAnim }
      ]}>
        <MapView
          ref={mapRef}
          style={styles.map}
          region={mapRegion}
          showsUserLocation={locationPermission}
          showsCompass={true}
          showsScale={true}
          showsTraffic={false}
          showsIndoors={true}
          showsBuildings={true}
        >
          {/* Draw the route */}
          {routeCoordinates.length > 1 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor={CONCORDIA_BURGUNDY}
              strokeWidth={4}
              lineDashPattern={[0]}
            />
          )}
          
          {/* Mark current location */}
          {currentLocation && (
            <Marker
              coordinate={currentLocation}
              title="Your Location"
            >
              <View style={styles.currentLocationMarker}>
                <View style={styles.currentLocationDot} />
              </View>
            </Marker>
          )}
          
          {/* Mark the buildings in the route */}
          {segmentDetails.map((segment, index) => {
            if (!segment.building) return null;
            
            return (
              <Marker
                key={index}
                coordinate={{
                  latitude: segment.building.latitude,
                  longitude: segment.building.longitude
                }}
                title={segment.building.name}
                description={segment.instruction?.substring(0, 30)}
              >
                <View style={[
                  styles.markerContainer,
                  activeSegment === index && styles.activeMarkerContainer
                ]}>
                  <Text style={styles.markerText}>{index + 1}</Text>
                </View>
              </Marker>
            );
          })}
        </MapView>
        
        <TouchableOpacity 
          style={styles.mapFullscreenButton}
          onPress={toggleMapFullscreen}
        >
          <Ionicons 
            name={showMapFullscreen ? "contract" : "expand"} 
            size={22} 
            color="#fff" 
          />
        </TouchableOpacity>
        
        {showMapFullscreen && (
          <View style={styles.mapControlsContainer}>
            <TouchableOpacity 
              style={styles.mapCloseButton}
              onPress={toggleMapFullscreen}
            >
              <Text style={styles.mapCloseButtonText}>Close Map</Text>
            </TouchableOpacity>
            
            {/* Add mini journey overview in fullscreen mode */}
            {segmentDetails.length > 0 && (
              <View style={styles.miniJourneyContainer}>
                {segmentDetails.map((segment, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={[
                      styles.miniSegmentIndicator,
                      activeSegment === index && styles.activeMiniSegment
                    ]}
                    onPress={() => selectSegment(index)}
                  >
                    <Text style={styles.miniSegmentText}>{index + 1}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </Animated.View>
    );
  };

  // Render journey segments (new, visually appealing approach)
  const renderJourneySegments = () => {
    if (!segmentDetails || segmentDetails.length === 0) return null;
    
    return (
      <View style={styles.journeyContainer}>
        <Text style={styles.journeySectionTitle}>Your Journey</Text>
        
        {/* Time and distance summary */}
        <View style={styles.journeySummary}>
          <View style={styles.summaryItem}>
            <FontAwesome5 name="clock" size={16} color={CONCORDIA_BURGUNDY} />
            <Text style={styles.summaryValue}>{planResult.totalTimeMinutes || '--'} min</Text>
            <Text style={styles.summaryLabel}>Total Time</Text>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryItem}>
            <FontAwesome5 name="map-signs" size={16} color={CONCORDIA_BURGUNDY} />
            <Text style={styles.summaryValue}>{planResult.totalDistance || '--'} m</Text>
            <Text style={styles.summaryLabel}>Distance</Text>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons name="weather-sunny" size={18} color={CONCORDIA_BURGUNDY} />
            <Text style={styles.summaryValue}>{planResult.totalIndoorPercentage || '--'}%</Text>
            <Text style={styles.summaryLabel}>Indoor</Text>
          </View>
        </View>
        
        {/* Weather advisory if applicable */}
        {(weatherData.precipitation || planResult.weatherAdvisory) && (
          <View style={styles.weatherAdvisoryCard}>
            <View style={styles.weatherAdvisoryHeader}>
              <Ionicons name={weatherData.precipitation ? "rainy" : "sunny"} size={22} color="#fff" />
              <Text style={styles.weatherAdvisoryTitle}>Weather Advisory</Text>
            </View>
            <Text style={styles.weatherAdvisoryText}>
              {planResult.weatherAdvisory || 
                (weatherData.precipitation 
                  ? "Rain detected. This route minimizes outdoor exposure where possible." 
                  : "Weather is favorable for outdoor travel.")}
            </Text>
          </View>
        )}
        
        {/* Route summary */}
        {planResult.routeSummary && (
          <View style={styles.routeSummaryCard}>
            <Text style={styles.routeSummaryText}>{planResult.routeSummary}</Text>
          </View>
        )}
        
        {/* Journey progress visualization */}
        <View style={styles.journeyProgressContainer}>
          {segmentDetails.map((segment, index) => (
            <React.Fragment key={`progress-${index}`}>
              {/* Connection line */}
              {index > 0 && (
                <View style={styles.progressLine} />
              )}
              
              {/* Segment indicator */}
              <TouchableOpacity
                onPress={() => selectSegment(index)}
                style={[
                  styles.segmentIndicator,
                  activeSegment === index && styles.activeSegmentIndicator
                ]}
              >
                <Text style={styles.segmentIndicatorText}>{index + 1}</Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>
        
        {/* Segment cards */}
        <FlatList
          horizontal
          data={segmentDetails}
          keyExtractor={(item, index) => `segment-card-${index}`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.segmentCardsContainer}
          snapToInterval={width - 80}
          decelerationRate="fast"
          onMomentumScrollEnd={(event) => {
            const slideIndex = Math.round(
              event.nativeEvent.contentOffset.x / (width - 80)
            );
            selectSegment(slideIndex);
          }}
          renderItem={({ item, index }) => (
            <View style={[
              styles.segmentCard,
              activeSegment === index && styles.activeSegmentCard
            ]}>
              {/* Card Header */}
              <View style={styles.segmentCardHeader}>
                <View style={styles.segmentCardTitleContainer}>
                  <Text style={styles.segmentCardTitle}>
                    {item.building?.name || `Stop ${index + 1}`}
                  </Text>
                  {item.building && (
                    <Text style={styles.segmentCardSubtitle}>
                      ({item.building.id})
                    </Text>
                  )}
                </View>
                
                <View style={[
                  styles.indoorBadge,
                  { backgroundColor: getIndoorPercentageColor(item.indoorPercentage) }
                ]}>
                  <MaterialCommunityIcons 
                    name={item.indoorPercentage > 50 ? "home-outline" : "tree-outline"} 
                    size={14} 
                    color="#fff" 
                  />
                  <Text style={styles.indoorBadgeText}>{item.indoorPercentage}% Indoor</Text>
                </View>
              </View>
              
              {/* Card Metrics */}
              <View style={styles.segmentMetrics}>
                <View style={styles.metricItemSmall}>
                  <FontAwesome5 name="clock" size={14} color="#666" />
                  <Text style={styles.metricValue}>{item.timeEstimate} min</Text>
                </View>
                
                <View style={styles.metricItemSmall}>
                  <FontAwesome5 name="walking" size={14} color="#666" />
                  <Text style={styles.metricValue}>{item.distance} m</Text>
                </View>
              </View>
              
              {/* Card Directions */}
              <View style={styles.segmentDirections}>
                <Text style={styles.directionsText}>{item.instruction}</Text>
              </View>
              
              {/* Card Actions */}
              <TouchableOpacity 
                style={styles.focusMapButton}
                onPress={() => {
                  selectSegment(index);
                  
                  // Center map on this building
                  if (item.building && mapRef.current) {
                    mapRef.current.animateToRegion({
                      latitude: item.building.latitude,
                      longitude: item.building.longitude,
                      latitudeDelta: 0.005,
                      longitudeDelta: 0.005,
                    }, 500);
                  }
                }}
              >
                <Text style={styles.focusMapButtonText}>Focus on Map</Text>
                <MaterialIcons name="my-location" size={16} color={CONCORDIA_BURGUNDY} />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    );
  };

  // Render plan result in new visually appealing way
  const renderEnhancedPlanResult = () => {
    if (!planResult) return null;
    
    return (
      <Animated.View
        style={[
          styles.enhancedPlanContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Top header with route summary */}
        <LinearGradient
          colors={['rgba(145, 35, 56, 0.95)', 'rgba(100, 25, 40, 1)']}
          style={styles.enhancedPlanHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.planTitleRow}>
            <FontAwesome5 name="route" size={24} color="#fff" />
            <Text style={styles.enhancedPlanTitle}>Your Optimized Route</Text>
          </View>
          
          {/* Progress bar for route completion */}
          <View style={styles.progressBarContainer}>
            <Animated.View 
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })
                }
              ]}
            />
          </View>
        </LinearGradient>
        
        {/* Enhanced map view */}
        {renderMap()}
        
        {/* Journey segments */}
        {renderJourneySegments()}
      </Animated.View>
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
      >
        {showMapFullscreen ? (
          renderMap()
        ) : (
          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollContainer}
            contentContainerStyle={{
              paddingBottom: 40,
              paddingTop: Platform.OS === 'android' ? insets.top : 0
            }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Smart Planner</Text>
                <Text style={styles.subtitle}>Plan your campus route</Text>
              </View>
              <TouchableOpacity onPress={toggleCampus} style={styles.campusToggle}>
                <View style={styles.campusIconContainer}>
                  <MaterialIcons name="location-on" size={14} color="#fff" />
                </View>
                <Text style={styles.campusToggleText}>
                  {campus === 'SGW' ? 'SGW Campus' : 'Loyola Campus'}
                </Text>
                <Ionicons name="swap-horizontal" size={18} color={CONCORDIA_BURGUNDY} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.weatherInfoContainer}>
              <Ionicons 
                name={getWeatherIcon()} 
                size={24} 
                color={CONCORDIA_BURGUNDY} 
              />
              <View style={styles.weatherTextContainer}>
                <Text style={styles.weatherInfo}>
                  {Math.round(weatherData.temperature)}°C, {weatherData.conditions}
                </Text>
                <Text style={styles.weatherSubtext}>
                  Current conditions at {campus} campus
                </Text>
              </View>
            </View>
            
            <View style={styles.tasksContainer}>
              <View style={styles.sectionTitleContainer}>
                <MaterialIcons name="playlist-add-check" size={22} color={CONCORDIA_BURGUNDY} />
                <Text style={styles.sectionTitle}>Your Tasks</Text>
              </View>
              
              <FlatList
                data={tasks}
                renderItem={renderTaskItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.taskList}
              />
              
              <View style={styles.addTaskContainer}>
                <TextInput
                  style={styles.addTaskInput}
                  value={currentTask}
                  onChangeText={setCurrentTask}
                  placeholder="Add a new task..."
                  placeholderTextColor="#999"
                />
                <TouchableOpacity onPress={addTask} style={styles.addButton}>
                  <LinearGradient
                    colors={['#912338', '#7a1e30']}
                    style={styles.addButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="add" size={24} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                onPress={generatePlan} 
                style={[
                  styles.generateButton,
                  loading && styles.generateButtonDisabled
                ]}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <LinearGradient
                    colors={['#912338', '#7a1e30']}
                    style={styles.generateButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="navigate" size={18} color="#ffffff" />
                    <Text style={styles.generateButtonText}>Generate Optimized Plan</Text>
                  </LinearGradient>
                )}
              </TouchableOpacity>
            </View>
            
            {renderEnhancedPlanResult()}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 2,
  },
  campusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  campusIconContainer: {
    backgroundColor: CONCORDIA_BURGUNDY,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  campusToggleText: {
    marginRight: 6,
    color: '#333',
    fontWeight: '600',
    fontSize: 13,
  },
  weatherInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  weatherTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  weatherInfo: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  weatherSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  tasksContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  taskList: {
    paddingBottom: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  taskNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: CONCORDIA_BURGUNDY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  taskNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskInput: {
    flex: 1,
    padding: 0,
    fontSize: 15,
    color: '#333',
  },
  removeButton: {
    padding: 4,
  },
  addTaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  addTaskInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#F9F9F9',
    fontSize: 15,
    color: '#333',
  },
  addButton: {
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  addButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  generateButtonDisabled: {
    backgroundColor: '#d3879a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
  },
  generateButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  
  // Enhanced plan result styles
  enhancedPlanContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  enhancedPlanHeader: {
    padding: 16,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  enhancedPlanTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: CONCORDIA_GOLD,
    borderRadius: 2,
  },
  
  // Map styles
  mapContainer: {
    overflow: 'hidden',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  fullscreenMapContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    borderRadius: 0,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapFullscreenButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 8,
    zIndex: 1,
  },
  mapControlsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  mapCloseButton: {
    backgroundColor: CONCORDIA_BURGUNDY,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  mapCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  miniJourneyContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 8,
    marginTop: 16,
  },
  miniSegmentIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeMiniSegment: {
    backgroundColor: CONCORDIA_BURGUNDY,
  },
  miniSegmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  
  // Marker styles
  currentLocationMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4285F4',
  },
  currentLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4285F4',
  },
  markerContainer: {
    backgroundColor: CONCORDIA_BURGUNDY,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  activeMarkerContainer: {
    backgroundColor: CONCORDIA_GOLD,
    transform: [{ scale: 1.2 }],
  },
  markerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  // Journey styles
  journeyContainer: {
    padding: 16,
  },
  journeySectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  journeySummary: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  weatherAdvisoryCard: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  weatherAdvisoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  weatherAdvisoryTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  weatherAdvisoryText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  routeSummaryCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  routeSummaryText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  journeyProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 12,
  },
  progressLine: {
    height: 3,
    backgroundColor: '#E0E0E0',
    flex: 1,
    marginHorizontal: -2,
  },
  segmentIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: CONCORDIA_BURGUNDY,
    marginHorizontal: 8,
    zIndex: 1,
  },
  activeSegmentIndicator: {
    backgroundColor: CONCORDIA_BURGUNDY,
  },
  segmentIndicatorText: {
    fontSize: 14,
    fontWeight: '700',
    color: CONCORDIA_BURGUNDY,
  },
  segmentCardsContainer: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  segmentCard: {
    width: width - 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeSegmentCard: {
    borderColor: CONCORDIA_BURGUNDY,
    borderWidth: 2,
    shadowColor: CONCORDIA_BURGUNDY,
    shadowOpacity: 0.2,
    elevation: 6,
  },
  segmentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  segmentCardTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  segmentCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  segmentCardSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  indoorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  indoorBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  segmentMetrics: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metricItemSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metricValue: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
  },
  segmentDirections: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  directionsText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  focusMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: CONCORDIA_BURGUNDY,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  focusMapButtonText: {
    color: CONCORDIA_BURGUNDY,
    fontSize: 14,
    fontWeight: '500',
    marginRight: 6,
  }
});

export default SmartPlannerScreen;