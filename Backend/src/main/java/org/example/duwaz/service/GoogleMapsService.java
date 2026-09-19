package org.example.duwaz.service;

import org.example.duwaz.dto.AddressDto;
import org.example.duwaz.dto.AddressSuggestionDto;
import org.example.duwaz.util.GeoLocationUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.*;

/**
 * Google Maps API service for geocoding, address validation, and location services.
 * 
 * Uses Google's Places and Geocoding REST APIs when enabled, with local fallbacks for development.
 */
@Service
public class GoogleMapsService {

    private static final Logger logger = LoggerFactory.getLogger(GoogleMapsService.class);
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${google.maps.api.key:YOUR_API_KEY_HERE}")
    private String googleMapsApiKey;

    @Value("${google.maps.enabled:false}")
    private boolean googleMapsEnabled;

    private AddressDto parseGoogleAddress(JsonNode node) {
        AddressDto address = new AddressDto();
        address.setFormattedAddress(node.path("formatted_address").asText());
        address.setPlaceId(node.path("place_id").asText(null));
        address.setLatitude(node.path("geometry").path("location").path("lat").asDouble());
        address.setLongitude(node.path("geometry").path("location").path("lng").asDouble());
        address.setIsGeocoded(true);
        address.setGeocodingProvider("GOOGLE_MAPS");
        address.setGeocodedAt(System.currentTimeMillis());
        for (JsonNode component : node.path("address_components")) {
            String value = component.path("long_name").asText();
            for (JsonNode type : component.path("types")) {
                switch (type.asText()) {
                    case "street_number", "route" -> address.setStreetAddress(
                            address.getStreetAddress() == null ? value : address.getStreetAddress() + " " + value);
                    case "locality", "postal_town" -> address.setCity(value);
                    case "postal_code" -> address.setPostalCode(value);
                    case "country" -> address.setCountry(value);
                    case "administrative_area_level_1" -> address.setProvince(value);
                    default -> { }
                }
            }
        }
        return address;
    }

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
            String url = UriComponentsBuilder.fromUriString("https://maps.googleapis.com/maps/api/geocode/json")
                    .queryParam("address", addressString)
                    .queryParam("key", googleMapsApiKey)
                    .queryParam("region", "za")
                    .build().toUriString();
            JsonNode result = objectMapper.readTree(restTemplate.getForObject(url, String.class));
            JsonNode first = result.path("results").path(0);
            if (first.isMissingNode()) return fallbackGeocodeAddress(addressString);
            return parseGoogleAddress(first);

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
            UriComponentsBuilder builder = UriComponentsBuilder.fromUriString("https://maps.googleapis.com/maps/api/place/autocomplete/json")
                    .queryParam("input", input)
                    .queryParam("components", "country:za")
                    .queryParam("key", googleMapsApiKey);
            if (latitude != null && longitude != null) {
                builder.queryParam("location", latitude + "," + longitude).queryParam("radius", 50000);
            }
            JsonNode root = objectMapper.readTree(restTemplate.getForObject(builder.build().toUriString(), String.class));
            List<AddressSuggestionDto> result = new ArrayList<>();
            for (JsonNode prediction : root.path("predictions")) {
                AddressSuggestionDto dto = new AddressSuggestionDto();
                dto.setPlaceId(prediction.path("place_id").asText());
                dto.setDescription(prediction.path("description").asText());
                dto.setMainText(prediction.path("structured_formatting").path("main_text").asText());
                dto.setSecondaryText(prediction.path("structured_formatting").path("secondary_text").asText());
                result.add(dto);
            }
            return result;

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
            String url = UriComponentsBuilder.fromUriString("https://maps.googleapis.com/maps/api/place/details/json")
                    .queryParam("place_id", placeId)
                    .queryParam("fields", "place_id,formatted_address,address_components,geometry,types")
                    .queryParam("key", googleMapsApiKey)
                    .build().toUriString();
            JsonNode result = objectMapper.readTree(restTemplate.getForObject(url, String.class));
            return parseGoogleAddress(result.path("result"));

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
        address.setGeocodingProvider("FALLBACK");

        String lower = addressString.toLowerCase();
        
        // CPUT Zonnebloem Campus (Main campus, District Six area)
        if (lower.contains("cput") || lower.contains("zonnebloem") || lower.contains("wale street") || 
            lower.contains("hanover street") || lower.contains("district six") || lower.contains("dorp street")) {
            address.setLatitude(-33.9636);
            address.setLongitude(18.4133);
            address.setCity("Cape Town");
            address.setProvince("Western Cape");
            address.setCountry("South Africa");
        }
        // CPUT City Campus (De Waterkant/Signal Hill)
        else if (lower.contains("city campus") || lower.contains("de waterkant") || 
                 lower.contains("prestwich street") || lower.contains("signal hill")) {
            address.setLatitude(-33.9250);
            address.setLongitude(18.4167);
            address.setCity("Cape Town");
            address.setProvince("Western Cape");
            address.setCountry("South Africa");
        }
        // Observatory area
        else if (lower.contains("obs") || lower.contains("observatory")) {
            address.setLatitude(-33.9380);
            address.setLongitude(18.4728);
            address.setCity("Cape Town");
            address.setProvince("Western Cape");
            address.setCountry("South Africa");
        }
        // Other surrounding areas
        else if (lower.contains("salt river")) {
            address.setLatitude(-33.9510);
            address.setLongitude(18.4367);
        } else if (lower.contains("woodstock")) {
            address.setLatitude(-33.9458);
            address.setLongitude(18.4608);
        } else if (lower.contains("mowbray")) {
            address.setLatitude(-33.9380);
            address.setLongitude(18.4728);
        } else if (lower.contains("rondebosch")) {
            address.setLatitude(-33.9380);
            address.setLongitude(18.4728);
        } else if (lower.contains("claremont")) {
            address.setLatitude(-33.9636);
            address.setLongitude(18.5250);
        } else if (lower.contains("camps bay")) {
            address.setLatitude(-33.9731);
            address.setLongitude(18.3848);
        } else if (lower.contains("newlands")) {
            address.setLatitude(-33.9723);
            address.setLongitude(18.4533);
        } else {
            // Default to CPUT area (Cape Town city center bias)
            address.setLatitude(-33.9636);
            address.setLongitude(18.4133);
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

        // CPUT Campus (Cape Peninsula University of Technology) area and surrounding Cape Town locations
        String[] commonLocations = {
            // CPUT Main Campus Area (District Six/Zonnebloem area)
            "CPUT, Zonnebloem Campus, Cape Town, South Africa",
            "Wale Street, CPUT, Cape Town, South Africa",
            "Hanover Street, Zonnebloem, Cape Town, South Africa",
            "Constitution Street, Zonnebloem, Cape Town, South Africa",
            "Dorp Street, Cape Town, South Africa",
            "Buitengracht Street, Cape Town, South Africa",
            
            // CPUT City Campus (De Waterkant/Signal Hill)
            "CPUT City Campus, De Waterkant, Cape Town, South Africa",
            "Prestwich Street, De Waterkant, Cape Town, South Africa",
            "Hans Strijdom Avenue, Signal Hill, Cape Town, South Africa",
            
            // Surrounding areas near CPUT
            "Salt River, Cape Town, South Africa",
            "District Six, Cape Town, South Africa",
            "Schotsche Kloof, Cape Town, South Africa",
            "Woodstock, Cape Town, South Africa",
            "Observatory, Cape Town, South Africa",
            "Mowbray, Cape Town, South Africa",
            "Rondebosch, Cape Town, South Africa",
            "Claremont, Cape Town, South Africa",
            
            // Main roads and landmarks
            "Main Road, Observatory, Cape Town, South Africa",
            "University Avenue, Observatory, Cape Town, South Africa",
            "Camps Bay, Cape Town, South Africa",
            "Newlands, Cape Town, South Africa",
            "Totara Park, Rondebosch, Cape Town, South Africa"
        };

        for (String location : commonLocations) {
            if (location.toLowerCase().contains(input.toLowerCase())) {
                AddressSuggestionDto suggestion = new AddressSuggestionDto();
                suggestion.setDescription(location);
                suggestion.setMainText(location.split(",")[0]);
                suggestion.setPlaceId("fallback-" + location.hashCode());
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
