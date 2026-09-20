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
     * Prefer readable location names and postal codes over raw coordinate strings.
     */
    private AddressDto fallbackGeocodeAddress(String addressString) {
        logger.debug("Using fallback geocoding for: {}", addressString);

        AddressDto address = new AddressDto();
        address.setIsGeocoded(false);
        address.setGeocodingProvider("FALLBACK");

        String rawInput = addressString == null ? "" : addressString.trim();
        String lower = rawInput.toLowerCase(Locale.ROOT);

        if (rawInput.matches("^-?\\d+(?:\\.\\d+)?\\s*[, ]\\s*-?\\d+(?:\\.\\d+)?$")) {
            String normalized = rawInput.replace(" ", "");
            String[] parts = normalized.split(",");
            try {
                address.setLatitude(Double.parseDouble(parts[0]));
                address.setLongitude(Double.parseDouble(parts[1]));
            } catch (Exception e) {
                address.setLatitude(-33.9269);
                address.setLongitude(18.4395);
            }
            address.setFormattedAddress("Cape Town CBD, Cape Town, South Africa");
            address.setCity("Cape Town");
            address.setProvince("Western Cape");
            address.setCountry("South Africa");
            return address;
        }

        if (lower.contains("castle") || lower.contains("good hope")) {
            address.setLatitude(-33.9269);
            address.setLongitude(18.4395);
            address.setFormattedAddress("Castle of Good Hope, Cape Town, South Africa");
        } else if (lower.contains("greenmarket") || lower.contains("company gardens")) {
            address.setLatitude(-33.9252);
            address.setLongitude(18.4171);
            address.setFormattedAddress("Company Gardens, Cape Town, South Africa");
        } else if (lower.contains("waterfront") || lower.contains("v&a") || lower.contains("va waterfront")) {
            address.setLatitude(-33.9067);
            address.setLongitude(18.4173);
            address.setFormattedAddress("V&A Waterfront, Cape Town, South Africa");
        } else if (lower.contains("table mountain") || lower.contains("signal hill")) {
            address.setLatitude(-33.9628);
            address.setLongitude(18.4102);
            address.setFormattedAddress("Table Mountain, Cape Town, South Africa");
        } else if (lower.contains("long street") || lower.contains("bree street") || lower.contains("adderley") || lower.contains("loop street") || lower.contains("kloof street")) {
            address.setLatitude(-33.9255);
            address.setLongitude(18.4192);
            address.setFormattedAddress("Cape Town CBD, Cape Town, South Africa");
        } else if (lower.contains("uct") || lower.contains("rondebosch") || lower.contains("mowbray") || lower.contains("observatory")) {
            address.setLatitude(-33.9580);
            address.setLongitude(18.4600);
            address.setFormattedAddress("University of Cape Town, Rondebosch, Cape Town, South Africa");
        } else if (lower.contains("cput") || lower.contains("zonnebloem") || lower.contains("wale street") || lower.contains("hanover street") || lower.contains("district six") || lower.contains("dorp street")) {
            address.setLatitude(-33.9636);
            address.setLongitude(18.4133);
            address.setFormattedAddress("CPUT, Zonnebloem Campus, Cape Town, South Africa");
        } else if (lower.contains("city campus") || lower.contains("de waterkant") || lower.contains("prestwich street")) {
            address.setLatitude(-33.9250);
            address.setLongitude(18.4167);
            address.setFormattedAddress("CPUT City Campus, De Waterkant, Cape Town, South Africa");
        } else if (lower.contains("salt river") || lower.contains("woodstock")) {
            address.setLatitude(-33.9470);
            address.setLongitude(18.4560);
            address.setFormattedAddress("Woodstock, Cape Town, South Africa");
        } else if (lower.contains("claremont") || lower.contains("newlands") || lower.contains("camps bay") || lower.contains("sea point") || lower.contains("green point") || lower.contains("bo-kaap") || lower.contains("gardens")) {
            address.setLatitude(-33.9269);
            address.setLongitude(18.4395);
            address.setFormattedAddress("Cape Town CBD, Cape Town, South Africa");
        } else if (lower.matches(".*\\b(?:8000|8001|8002|8005|8060|7925|7700|8040|7080|7180)\\b.*")) {
            address.setLatitude(-33.9269);
            address.setLongitude(18.4395);
            address.setFormattedAddress("Cape Town CBD, Cape Town, South Africa");
        } else {
            address.setLatitude(-33.9269);
            address.setLongitude(18.4395);
            address.setFormattedAddress("Cape Town CBD, Cape Town, South Africa");
        }

        address.setCity("Cape Town");
        address.setProvince("Western Cape");
        address.setCountry("South Africa");
        return address;
    }

    /**
     * Fallback autocomplete suggestions when Google Maps API is not available.
     */
    private List<AddressSuggestionDto> fallbackAutocompleteSuggestions(String input) {
        logger.debug("Using fallback autocomplete for: {}", input);

        if (input == null || input.isBlank()) {
            return new ArrayList<>();
        }

        String normalizedInput = input.trim().toLowerCase(Locale.ROOT).replace("&", "and");
        String sanitizedInput = normalizedInput.replaceAll("[^a-z0-9 ]", "").trim();

        if (sanitizedInput.length() < 3) {
            return new ArrayList<>();
        }

        List<AddressSuggestionDto> suggestions = new ArrayList<>();

        String[] commonLocations = {
            "Cape Town CBD, 8001, South Africa",
            "Long Street, 8001, Cape Town, South Africa",
            "Bree Street, 8001, Cape Town, South Africa",
            "Loop Street, 8001, Cape Town, South Africa",
            "Adderley Street, 8001, Cape Town, South Africa",
            "Greenmarket Square, 8001, Cape Town, South Africa",
            "Castle of Good Hope, 8001, Cape Town, South Africa",
            "Company Gardens, 8001, Cape Town, South Africa",
            "V&A Waterfront, 8002, Cape Town, South Africa",
            "Waterfront, 8002, Cape Town, South Africa",
            "Kloof Street, 8001, Cape Town, South Africa",
            "Gardens, 8001, Cape Town, South Africa",
            "Foreshore, 8001, Cape Town, South Africa",
            "Bo-Kaap, 8001, Cape Town, South Africa",
            "Vredehoek, 8001, Cape Town, South Africa",
            "Tamboerskloof, 8001, Cape Town, South Africa",
            "Oranjezicht, 8001, Cape Town, South Africa",
            "Green Point, 8001, Cape Town, South Africa",
            "Sea Point, 8060, Cape Town, South Africa",
            "Table Mountain, 8001, Cape Town, South Africa",
            "City Hall, 8001, Cape Town, South Africa",
            "Signal Hill, 8001, Cape Town, South Africa",
            "CPUT, Zonnebloem Campus, 8000, Cape Town, South Africa",
            "Wale Street, 8001, Cape Town, South Africa",
            "Hanover Street, 8001, Cape Town, South Africa",
            "District Six, 8000, Cape Town, South Africa",
            "Salt River, 7925, Cape Town, South Africa",
            "Woodstock, 7925, Cape Town, South Africa",
            "Observatory, 7925, Cape Town, South Africa",
            "Mowbray, 7700, Cape Town, South Africa",
            "Rondebosch, 7700, Cape Town, South Africa",
            "Claremont, 7700, Cape Town, South Africa",
            "University of Cape Town, 7700, Rondebosch, Cape Town, South Africa",
            "UCT, 7700, Rondebosch, Cape Town, South Africa",
            "Camps Bay, 8040, Cape Town, South Africa",
            "Newlands, 7700, Cape Town, South Africa",
            "Totara Park, 7700, Rondebosch, Cape Town, South Africa"
        };

        for (String location : commonLocations) {
            String lowerLocation = location.toLowerCase(Locale.ROOT);
            if (matchesFallbackLocation(sanitizedInput, lowerLocation)) {
                AddressSuggestionDto suggestion = new AddressSuggestionDto();
                suggestion.setDescription(location);
                suggestion.setMainText(location.split(",")[0]);
                suggestion.setPlaceId("fallback-" + location.hashCode());
                suggestions.add(suggestion);
            }
        }

        if (!suggestions.isEmpty()) {
            return suggestions;
        }

        String[] landMarks = {
            "cbd", "city bowl", "castle", "greenmarket", "company gardens", "waterfront",
            "table mountain", "long street", "bree street", "kloof street",
            "gardens", "bo kaap", "uct", "university of cape town", "observatory",
            "8001", "8002", "7925", "7700"
        };

        for (String alias : landMarks) {
            if (sanitizedInput.contains(alias) || alias.contains(sanitizedInput)) {
                String label = switch (alias) {
                    case "castle" -> "Castle of Good Hope, 8001, Cape Town, South Africa";
                    case "greenmarket" -> "Greenmarket Square, 8001, Cape Town, South Africa";
                    case "company gardens" -> "Company Gardens, 8001, Cape Town, South Africa";
                    case "waterfront" -> "V&A Waterfront, 8002, Cape Town, South Africa";
                    case "table mountain" -> "Table Mountain, 8001, Cape Town, South Africa";
                    case "long street" -> "Long Street, 8001, Cape Town, South Africa";
                    case "bree street" -> "Bree Street, 8001, Cape Town, South Africa";
                    case "kloof street" -> "Kloof Street, 8001, Cape Town, South Africa";
                    case "gardens" -> "Gardens, 8001, Cape Town, South Africa";
                    case "bo kaap" -> "Bo-Kaap, 8001, Cape Town, South Africa";
                    case "uct", "university of cape town" -> "University of Cape Town, 7700, Rondebosch, Cape Town, South Africa";
                    case "cbd", "city bowl" -> "Cape Town CBD, 8001, South Africa";
                    case "8001", "8002", "7925", "7700" -> "Cape Town CBD, " + alias + ", South Africa";
                    default -> "Cape Town CBD, 8001, South Africa";
                };

                AddressSuggestionDto suggestion = new AddressSuggestionDto();
                suggestion.setDescription(label);
                suggestion.setMainText(label.split(",")[0]);
                suggestion.setPlaceId("fallback-alias-" + alias.hashCode());
                suggestions.add(suggestion);
            }
        }

        return suggestions;
    }

    private boolean matchesFallbackLocation(String normalizedInput, String lowerLocation) {
        if (normalizedInput.isEmpty()) {
            return true;
        }

        if (normalizedInput.matches("\\d{3,5}")) {
            return lowerLocation.contains(normalizedInput);
        }

        String[] searchableTokens = {
            "cape town", "cbd", "city bowl", "waterfront", "castle", "greenmarket",
            "company gardens", "table mountain", "signal hill", "long street", "bree street",
            "adderley", "loop street", "kloof street", "gardens", "bo kaap", "district six",
            "zonnebloem", "de waterkant", "observatory", "mowbray", "rondebosch", "claremont",
            "uct", "newlands", "camps bay", "sea point", "green point", "8001", "8002", "7925", "7700"
        };

        for (String token : searchableTokens) {
            boolean isPrefixMatch = normalizedInput.startsWith(token) || token.startsWith(normalizedInput);
            boolean isLocationMatch = lowerLocation.contains(normalizedInput) || lowerLocation.contains(token);
            if (isPrefixMatch || isLocationMatch) {
                return true;
            }
        }

        return lowerLocation.contains(normalizedInput) || lowerLocation.startsWith(normalizedInput);
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
