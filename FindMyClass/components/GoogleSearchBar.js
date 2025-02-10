import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { googleAPIKey } from "../app/secrets";


export default function GoogleSearchBar({ onLocationSelected }) {
    return (
        <GooglePlacesAutocomplete
            placeholder="Search for a place"
            minLength={2}
            fetchDetails={true}
            onPress={(data, details = null) => {
                if (details) {
                    const location = {
                        latitude: details.geometry.location.lat,
                        longitude: details.geometry.location.lng,
                    };
                    console.log("Selected Location:", location);
                    onLocationSelected(location); //  Pass location back to parent component
                }
            }}
            query={{
                key: googleAPIKey,
                language: "en",
                components: "country:ca",
                locationbias: "circle:100000@45.5017,-73.5673", // Bias results to Montreal
            }}
           // onFail={(error) => console.error("Failed Google Places:", error)}
            styles={{
               // container: { position: "absolute", top: 50, width: "90%", alignSelf: "center", zIndex: 1 },
                textInput: { height: 44, borderWidth: 1, borderColor: "#ccc", paddingHorizontal: 10 },
            }}
        />
    );
}
