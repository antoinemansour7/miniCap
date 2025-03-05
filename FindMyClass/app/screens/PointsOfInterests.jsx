import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, TextInput, Animated, StyleSheet } from "react-native";
import * as Location from "expo-location";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router"; // Import navigation hook

const categories = ["Restaurant", "Café", "Bakery", "Other"];
const googleAPIKey = "AIzaSyAMimof390OY-MHLbUOkdwsTh3f56StuRk"; // Replace with your API key

export default function PointsOfInterests() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [customCategory, setCustomCategory] = useState("");
  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [maxResults, setMaxResults] = useState(10);
  const fadeAnim = useState(new Animated.Value(0))[0]; // Fade animation for initial message
  const router = useRouter(); 

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied");
        return;
      }
      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation.coords);
    })();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [selectedCategory]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  const fetchPlaces = async (category) => {
    if (!location) return;

    const categoryMap = {
      "Restaurant": "restaurant",
      "Café": "cafe",
      "Bakery": "bakery",
      "Hospital": "hospital", // Ensure valid type
    };

    let placeType = category !== "Other" ? categoryMap[category] || category.toLowerCase() : customCategory.toLowerCase();

    // ✅ Set the search keyword dynamically
    let keyword = placeType;

    // ✅ Increase radius dynamically for hospitals or general searches
    let searchRadius = placeType === "hospital" ? 10000 : 5000;

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude},${location.longitude}&rankby=distance&type=${placeType}&keyword=${keyword}&key=${googleAPIKey}`
      );

      const data = await response.json();

      // ✅ Filter out unrelated places (e.g., UPS Store appearing for hospitals)
      let filteredResults = data.results.filter(place =>
        place.types.includes(placeType) || place.name.toLowerCase().includes(keyword)
      );

      let placesWithDistance = filteredResults.map((place) => ({
        ...place,
        distance: parseFloat(
          calculateDistance(
            location.latitude,
            location.longitude,
            place.geometry.location.lat,
            place.geometry.location.lng
          )
        ),
      }));

      placesWithDistance.sort((a, b) => a.distance - b.distance);

      setPlaces(placesWithDistance.slice(0, maxResults));
    } catch (error) {
      console.error("Error fetching places:", error);
    }
};

  useEffect(() => {
    if (selectedCategory || customCategory) {
      fetchPlaces(selectedCategory);
    }
  }, [maxResults]);

  return (
    <View style={styles.container}>
      <View style={styles.categoryContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[styles.categoryButton, selectedCategory === category && styles.selectedCategoryButton]}
            onPress={() => {
              setSelectedCategory(category);
              setCustomCategory(""); // Reset custom input if a predefined category is selected
              if (category !== "Other") {
                fetchPlaces(category);
              }
            }}
          >
            <Text style={[styles.categoryText, selectedCategory === category && styles.selectedCategoryText]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Show Text Input ONLY when "Other" is selected */}
      {selectedCategory === "Other" && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter any place type..."
            value={customCategory}
            onChangeText={setCustomCategory}
            onSubmitEditing={() => fetchPlaces(customCategory)}
          />
          <TouchableOpacity style={styles.searchButton} onPress={() => fetchPlaces(customCategory)}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Slider Component for Max Results */}
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Max Results: {maxResults}</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={20}
          step={1}
          value={maxResults}
          onValueChange={(value) => setMaxResults(value)}
          minimumTrackTintColor="#9B1B30"
          maximumTrackTintColor="#ddd"
          thumbTintColor="#9B1B30"
        />
      </View>

      {/* If no category is selected, show the welcome message */}
      {!selectedCategory ? (
        <Animated.View style={[styles.welcomeContainer, { opacity: fadeAnim }]}>
          <Text style={styles.welcomeEmoji}>🗺️</Text>
          <Text style={styles.welcomeTitle}>Find Amazing Places Near You!</Text>
          <Text style={styles.welcomeSubtitle}>
            Select a category above to explore nearby places.
          </Text>
        </Animated.View>
      ) : (
        <FlatList
          data={places}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <View style={styles.placeItem}>
              <View style={styles.placeInfo}>
                <Text style={styles.placeName}>{item.name}</Text>
                <Text style={styles.placeDetails}>{item.vicinity}</Text>
                <Text style={styles.placeDetails}>Rating: {item.rating || "N/A"} | {item.distance} km away</Text>
              </View>
              <TouchableOpacity
              style={styles.directionsButton}
              onPress={() =>
                router.push({
                  pathname: "/screens/directions",
                  params: {
                    destination: JSON.stringify({
                      latitude: item.geometry.location.lat,
                      longitude: item.geometry.location.lng,
                    }),
                    buildingName: item.name, 
                  },
                })
              }
            >
                <Text style={styles.directionsButtonText}>Get Directions</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-around", // Ensures they are evenly spaced in one line
    alignItems: "center",
    width: "100%",
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  
  categoryButton: {
    flexShrink: 1, // Allows buttons to shrink if necessary
    maxWidth: "35%", // Increases width slightly so "Restaurants" fits
    paddingVertical: 8, 
    paddingHorizontal: 8, // Adjust padding to prevent text wrapping
    marginHorizontal: 2, // Keeps buttons evenly spaced
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
  },
  
  
  selectedCategoryButton: {
    backgroundColor: "#9B1B30",
  },
  categoryText: {
    fontSize: 18, 
    fontWeight: "bold",
    textAlign: "center",
    flexWrap: "nowrap", // Prevents text from breaking into two lines
    color: "#444",
  },
  
  selectedCategoryText: {
    color: "#fff",
  },
  sliderContainer: {
    alignItems: "center",
    marginVertical: 15,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 5,
  },
  slider: {
    width: "80%",
    height: 40,
  },
  welcomeContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  welcomeEmoji: {
    fontSize: 50,
    marginBottom: 10,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginHorizontal: 20,
    marginTop: 5,
  },
  placeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  placeDetails: {
    fontSize: 14,
    color: "#666",
  },
  directionsButton: {
    backgroundColor: "#9B1B30",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  directionsButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    margin: 15,
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchButton: {
    marginLeft: 10,
    backgroundColor: "#9B1B30",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  
});