import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { googleAPIKey } from "../../app/secrets";
import { useRef, useEffect } from 'react';

export default function GoogleSearchBar({ onLocationSelected, initialValue }) {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current && initialValue) {
            ref.current.setAddressText(initialValue);
        }
    }, [initialValue]);

    return (
        <GooglePlacesAutocomplete
            ref={ref}
            placeholder="Search for a place"
            minLength={2}
            fetchDetails={true}
            onPress={(data, details = null) => {
                if (details) {
                    const location = {
                        latitude: details.geometry.location.lat,
                        longitude: details.geometry.location.lng,
                    };
                    onLocationSelected(location, data.description);
                }
            }}
            query={{
                key: googleAPIKey,
                language: "en",
                components: "country:ca",
                locationbias: "circle:100000@45.5017,-73.5673", // Bias results to Montreal
            }}
            styles={{
                textInput: { height: 44, borderWidth: 1, borderColor: "#ccc", paddingHorizontal: 10 },
            }}
        />
    );
}
