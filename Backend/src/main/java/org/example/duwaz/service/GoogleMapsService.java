package org.example.duwaz.service;

import org.example.duwaz.dto.AddressDto;
import org.example.duwaz.dto.AddressSuggestionDto;
import org.example.duwaz.util.GeoLocationUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

/**
 * Google Maps API service for geocoding, address validation, and location services.
 * 
 * Note: This is a stub implementation. For production, integrate with actual Google Maps API:
 * - Add google-maps-services dependency to pom.xml
 * - Get API key from Google Cloud Console
 * - Enable Geocoding API, Places API, Distance Matrix API
 */
@Service
public class GoogleMapsService {

    private static final Logger logger = LoggerFactory.getLogger(GoogleMapsService.class);

    @Value("${google.maps.api.key:YOUR_API_KEY_HERE}")
    private String googleMapsApiKey;

    @Value("${google.maps.enabled:false}")
    private boolean googleMapsEnabled;

    /**
     * Geocode an address string to coordinates.
     * 
     * @param addressString User-entered address (e.g., "123 Main Street, Cape Town")
     * @return AddressDto with geocoded coordinates, or null if not found
     */
    public AddressDto geocodeAddress(String addressString) {
        if (!googleMapsEnabled) {
            logger.warn("Google Maps API is not enabled. Implement actual geocoding.");
            return fallbackGeocodeAddress(addressString);
        }

        try {
            // TODO: Implement actual Google Geocoding API call
            // GeoApiContext context = new GeoApiContext.Builder()
            //     .apiKey(googleMapsApiKey)
            //     .build();
            // GeocodingResult[] results = GeocodingApi.geocode(context, addressString).await();
            // if (results.length > 0) {
            //     LatLng location = results[0].geometry.location;
            //     return parseGeocodeResult(results[0], addressString);
            // }

            logger.info("Geocoding address: {}", addressString);
            return fallbackGeocodeAddress(addressString);

        } catch (Exception e) {
            logger.error("Error geocoding address: {}", addressString, e);
            return fallbackGeocodeAddress(addressString);
        }
    }

    /**
     * Get address autocomplete suggestions as user types.
     *
     * @param input Partial address input (e.g., "123 Main")
     * @param latitude Current latitude (for biasing results)
     * @param longitude Current longitude (for biasing results)
     * @return List of AddressSuggestionDto
     */
    public List<AddressSuggestionDto> getAddressAutocompleteSuggestions(
            String input, Double latitude, Double longitude) {

        if (!googleMapsEnabled) {
            logger.warn("Google Maps API is not enabled. Implement actual autocomplete.");
            return fallbackAutocompleteSuggestions(input);
        }

        try {
            // TODO: Implement actual Google Places Autocomplete API call
            // PlacesRequestParams params = new PlacesRequestParams()
            //     .input(input)
            //     .components(new String[]{"country:za"})  // Restrict to South Africa
            //     .sessionToken(sessionToken);
            // if (latitude != null && longitude != null) {
            //     params.location(latitude, longitude).radius(50000);  // Bias to 50km radius
            // }
            // AutocompletePrediction[] predictions = PlacesApi.placeAutocomplete(context, params).await();

            logger.info("Getting autocomplete suggestions for: {}", input);
            return fallbackAutocompleteSuggestions(input);

        } catch (Exception e) {
            logger.error("Error getting autocomplete suggestions: {}", input, e);
            return fallbackAutocompleteSuggestions(input);
        }
    }

    /**
     * Get detailed information about an address from place ID.
     * Includes coordinates, address components, photos, etc.
     *
     * @param placeId Google Place ID
     * @return AddressDto with full details
     */
    public AddressDto getPlaceDetails(String placeId) {
        if (!googleMapsEnabled) {
            logger.warn("Google Maps API is not enabled. Implement actual place details call.");
            return new AddressDto();
        }

        try {
            // TODO: Implement actual Google Places Details API call
            // PlaceDetailsRequest request = PlacesApi.placeDetails(context, placeId);
            // PlaceDetail detail = request.await();
            // return parsePlaceDetail(detail);

            logger.info("Getting place details for place ID: {}", placeId);
            return new AddressDto();

        } catch (Exception e) {
            logger.error("Error getting place details for: {}", placeId, e);
            return new AddressDto();
        }
    }

    /**
     * Calculate distance and estimated travel time between two addresses.
     *
     * @param fromAddress Origin address
     * @param toAddress Destination address
     * @return Map with distance (km), durationSeconds, and googleDistance if available
     */
    public Map<String, Object> calculateDistance(String fromAddress, String toAddress) {
        return calculateDistance(fromAddress, toAddress, "driving");
    }

    /**
     * Calculate distance using mode: driving, walking, bicycling, transit
     */
    public Map<String, Object> calculateDistance(String fromAddress, String toAddress, String mode) {
        Map<String, Object> result = new HashMap<>();

        try {
            // First, geocode both addresses
            AddressDto fromAddr = geocodeAddress(fromAddress);
            AddressDto toAddr = geocodeAddress(toAddress);

            if (fromAddr == null || toAddr == null || fromAddr.getLatitude() == null || toAddr.getLatitude() == null) {
                logger.warn("Could not geocode addresses for distance calculation");
                result.put("error", "Could not geocode addresses");
                return result;
            }

            // Use Haversine formula for distance (works without Distance Matrix API)
            java.math.BigDecimal distanceKm = GeoLocationUtil.calculateDistanceKm(
                fromAddr.getLatitude(), fromAddr.getLongitude(),
                toAddr.getLatitude(), toAddr.getLongitude()
            );

            // Estimate time based on mode and distance
            double speedKmH = getAverageSpeedForMode(mode);
            int durationSeconds = (int) (distanceKm.doubleValue() / speedKmH * 3600);

            result.put("distanceKm", distanceKm);
            result.put("distanceMeters", distanceKm.multiply(java.math.BigDecimal.valueOf(1000)));
            result.put("durationSeconds", durationSeconds);
            result.put("durationMinutes", durationSeconds / 60);
            result.put("mode", mode);

            // TODO: If Distance Matrix API is available, add actual travel time
            // DistancematrixApiRequest request = DistanceMatrixApi.newRequest(context)
            //     .origins(from)
            //     .destinations(to)
            //     .mode(TravelMode.valueOf(mode.toUpperCase()));
            // DistanceMatrix distMatrix = request.await();
            // result.put("googleDistance", distMatrix.rows[0].elements[0].distance.humanReadable);
            // result.put("googleDuration", distMatrix.rows[0].elements[0].duration.humanReadable);

            return result;

        } catch (Exception e) {
            logger.error("Error calculating distance", e);
            result.put("error", e.getMessage());
            return result;
        }
    }

    /**
     * Validate if address is within service area (South Africa, preferably specific radius).
     */
    public boolean isAddressInServiceArea(AddressDto address) {
        if (address == null || address.getLatitude() == null || address.getLongitude() == null) {
            return false;
        }

        // Check if within South Africa
        boolean inZA = GeoLocationUtil.isWithinSouthAfrica(address.getLatitude(), address.getLongitude());

        if (!inZA) {
            logger.warn("Address {} is outside South Africa", address.getFormattedAddress());
            return false;
        }

        // TODO: Add specific campus radius check if needed
        // double maxDistanceFromCampus = 10.0;  // km
        // return GeoLocationUtil.isWithinRadius(campusLat, campusLon, address.getLatitude(), address.getLongitude(), maxDistanceFromCampus);

        return true;
    }

    /**
     * Find nearby addresses/businesses based on type.
     */
    public List<AddressDto> findNearbyPlaces(double latitude, double longitude, 
                                            String placeType, double radiusKm, int maxResults) {
        List<AddressDto> results = new ArrayList<>();

        try {
            // TODO: Implement Google Places Nearby Search API
            // NearbySearchRequest request = PlacesApi.nearbySearchQuery(context, new LatLng(latitude, longitude))
            //     .type(placeType)
            //     .radius((int)(radiusKm * 1000));  // Convert km to meters
            // PlacesSearchResponse response = request.await();
            // for (PlacesSearchResult place : response.results) {
            //     if (results.size() >= maxResults) break;
            //     results.add(parsePlaceResult(place));
            // }

            logger.info("Finding {} nearby places within {}km of {},{}", 
                placeType, radiusKm, latitude, longitude);

            return results;

        } catch (Exception e) {
            logger.error("Error finding nearby places", e);
            return results;
        }
    }

    // ── Helper Methods ────────────────────────────────────────────────────────

    /**
     * Fallback geocoding when Google Maps API is not available.
     * Returns reasonable default coordinates for testing.
     */
    private AddressDto fallbackGeocodeAddress(String addressString) {
        logger.debug("Using fallback geocoding for: {}", addressString);

        AddressDto address = new AddressDto();
        address.setFormattedAddress(addressString);
        address.setIsGeocoded(false);
        address.setGeocodingProvider("USER_INPUT");

        // Default to University of Cape Town area for testing
        // Latitude: -33.9249, Longitude: 18.4241
        if (addressString.toLowerCase().contains("obs") || 
            addressString.toLowerCase().contains("observatory")) {
            address.setLatitude(-33.9380);
            address.setLongitude(18.4728);
            address.setCity("Cape Town");
            address.setProvince("Western Cape");
            address.setCountry("South Africa");
        } else {
            // Generic fallback (Cape Town city center)
            address.setLatitude(-33.9249);
            address.setLongitude(18.4241);
            address.setCity("Cape Town");
            address.setProvince("Western Cape");
            address.setCountry("South Africa");
        }

        return address;
    }

    /**
     * Fallback autocomplete suggestions when Google Maps API is not available.
     */
    private List<AddressSuggestionDto> fallbackAutocompleteSuggestions(String input) {
        logger.debug("Using fallback autocomplete for: {}", input);

        List<AddressSuggestionDto> suggestions = new ArrayList<>();

        // Suggest common Cape Town locations
        String[] commonLocations = {
            "Observatory, Cape Town, South Africa",
            "Main Road, Observatory, Cape Town, South Africa",
            "University Avenue, Observatory, Cape Town, South Africa",
            "Camps Bay, Cape Town, South Africa",
            "Claremont, Cape Town, South Africa",
            "Rondebosch, Cape Town, South Africa",
            "Newlands, Cape Town, South Africa"
        };

        for (String location : commonLocations) {
            if (location.toLowerCase().contains(input.toLowerCase())) {
                AddressSuggestionDto suggestion = new AddressSuggestionDto();
                suggestion.setDescription(location);
                suggestion.setMainText(location.split(",")[0]);
                suggestions.add(suggestion);
            }
        }

        return suggestions;
    }

    /**
     * Get average travel speed for a given mode of transport.
     */
    private double getAverageSpeedForMode(String mode) {
        return switch (mode.toLowerCase()) {
            case "walking" -> 5.0;      // km/h
            case "bicycling" -> 15.0;   // km/h
            case "transit" -> 25.0;     // km/h (buses, trains)
            case "driving" -> 30.0;     // km/h (urban average with traffic)
            default -> 30.0;
        };
    }

    /**
     * Parse Google Geocoding API result into AddressDto.
     * This would be called from actual geocodeAddress() when API is enabled.
     */
    private AddressDto parseGeocodeResult(Object result, String originalAddress) {
        // TODO: Implement actual parsing of Google Geocoding API response
        logger.info("Would parse geocoding result for: {}", originalAddress);
        return new AddressDto();
    }

    /**
     * Parse Google Places Detail result into AddressDto.
     */
    private AddressDto parsePlaceDetail(Object detail) {
        // TODO: Implement actual parsing of Google Places Detail API response
        logger.info("Would parse place detail");
        return new AddressDto();
    }
}
