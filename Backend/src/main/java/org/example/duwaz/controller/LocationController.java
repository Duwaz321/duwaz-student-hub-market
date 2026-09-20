package org.example.duwaz.controller;

import org.example.duwaz.dto.AddressDto;
import org.example.duwaz.dto.AddressSuggestionDto;
import org.example.duwaz.service.GoogleMapsService;
import org.example.duwaz.util.GeoLocationUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

/**
 * Location and geolocation API endpoints.
 * Provides address autocomplete, geocoding, distance calculations, and nearby place search.
 */
@RestController
@RequestMapping("/api/locations")
public class LocationController {

    private static final Logger logger = LoggerFactory.getLogger(LocationController.class);

    @Autowired
    private GoogleMapsService googleMapsService;

    /**
     * Get address autocomplete suggestions.
     * 
     * GET /api/locations/autocomplete?input=123%20Main&lat=-33.93&lon=18.42
     * 
     * @param input Partial address string (e.g., "123 Main", "Observatory")
     * @param latitude Optional current latitude (for biasing results)
     * @param longitude Optional current longitude (for biasing results)
     * @return List of AddressSuggestionDto with predictions
     */
    @GetMapping("/autocomplete")
    public ResponseEntity<?> getAddressAutocomplete(
            @RequestParam String input,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude) {

        try {
            if (input == null || input.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Input is required"));
            }

            List<AddressSuggestionDto> suggestions = googleMapsService.getAddressAutocompleteSuggestions(
                input, latitude, longitude
            );

            return ResponseEntity.ok(Map.of(
                "predictions", suggestions,
                "count", suggestions.size()
            ));

        } catch (Exception e) {
            logger.error("Error in autocomplete: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error getting suggestions: " + e.getMessage()));
        }
    }

    /**
     * Get full address details from Google Place ID.
     * 
     * GET /api/locations/place/{placeId}
     * 
     * @param placeId Google Maps Place ID (from autocomplete)
     * @return AddressDto with full details and coordinates
     */
    @GetMapping("/place/{placeId}")
    public ResponseEntity<?> getPlaceDetails(@PathVariable String placeId) {
        try {
            if (placeId == null || placeId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Place ID is required"));
            }

            AddressDto place = googleMapsService.getPlaceDetails(placeId);

            return ResponseEntity.ok(place);

        } catch (Exception e) {
            logger.error("Error getting place details: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error getting place details: " + e.getMessage()));
        }
    }

    /**
     * Geocode an address string to coordinates.
     * 
     * POST /api/locations/geocode
     * Body: { "address": "123 Main Street, Cape Town" }
     * 
     * @return AddressDto with coordinates
     */
    @PostMapping("/geocode")
    public ResponseEntity<?> geocodeAddress(@RequestBody Map<String, String> body) {
        try {
            String address = body.get("address");
            if (address == null || address.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Address is required"));
            }

            AddressDto result = googleMapsService.geocodeAddress(address);

            if (result == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Address not found"));
            }

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            logger.error("Error geocoding address: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error geocoding: " + e.getMessage()));
        }
    }

    /**
     * Calculate distance between two addresses or coordinates.
     * 
     * POST /api/locations/distance
     * Body: { 
     *   "fromAddress": "123 Main St, Cape Town",
     *   "toAddress": "456 High St, Cape Town",
     *   "mode": "driving"  // optional: driving, walking, bicycling, transit
     * }
     * 
     * @return Map with distanceKm, durationSeconds, etc.
     */
    @PostMapping("/distance")
    public ResponseEntity<?> calculateDistance(@RequestBody Map<String, String> body) {
        try {
            String fromAddress = body.get("fromAddress");
            String toAddress = body.get("toAddress");
            String mode = body.getOrDefault("mode", "driving");

            if (fromAddress == null || toAddress == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "fromAddress and toAddress are required"));
            }

            Map<String, Object> result = googleMapsService.calculateDistance(fromAddress, toAddress, mode);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            logger.error("Error calculating distance: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error calculating distance: " + e.getMessage()));
        }
    }

    /**
     * Calculate distance between two coordinates using Haversine formula.
     * Faster than geocoding+distance for known coordinates.
     * 
     * GET /api/locations/distance/coords?lat1=-33.93&lon1=18.42&lat2=-33.94&lon2=18.43
     * 
     * @return Map with distanceKm, durationSeconds, bearing, etc.
     */
    @GetMapping("/distance/coords")
    public ResponseEntity<?> calculateDistanceCoords(
            @RequestParam Double lat1,
            @RequestParam Double lon1,
            @RequestParam Double lat2,
            @RequestParam Double lon2,
            @RequestParam(defaultValue = "driving") String mode) {

        try {
            if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "All coordinates (lat1, lon1, lat2, lon2) are required"));
            }

            // Validate coordinates
            if (!GeoLocationUtil.isValidCoordinate(lat1, lon1) || 
                !GeoLocationUtil.isValidCoordinate(lat2, lon2)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid coordinates"));
            }

            BigDecimal distanceKm = GeoLocationUtil.calculateDistanceKm(lat1, lon1, lat2, lon2);
            double bearing = GeoLocationUtil.calculateBearing(lat1, lon1, lat2, lon2);
            double speedKmH = getAverageSpeedForMode(mode);
            int durationSeconds = (int) (distanceKm.doubleValue() / speedKmH * 3600);

            return ResponseEntity.ok(Map.of(
                "distanceKm", distanceKm,
                "distanceMeters", distanceKm.multiply(java.math.BigDecimal.valueOf(1000)),
                "durationSeconds", durationSeconds,
                "durationMinutes", durationSeconds / 60,
                "bearingDegrees", bearing,
                "mode", mode
            ));

        } catch (Exception e) {
            logger.error("Error calculating distance: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error calculating distance: " + e.getMessage()));
        }
    }

    /**
     * Check if address is within service area.
     * 
     * POST /api/locations/validate
     * Body: { "address": "123 Main St, Cape Town" }
     * 
     * @return Map with isValid, message
     */
    @PostMapping("/validate")
    public ResponseEntity<?> validateAddress(@RequestBody Map<String, String> body) {
        try {
            String address = body.get("address");
            if (address == null || address.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Address is required"));
            }

            AddressDto geocoded = googleMapsService.geocodeAddress(address);
            boolean isValid = googleMapsService.isAddressInServiceArea(geocoded);

            return ResponseEntity.ok(Map.of(
                "isValid", isValid,
                "address", geocoded.getFormattedAddress(),
                "latitude", geocoded.getLatitude(),
                "longitude", geocoded.getLongitude(),
                "message", isValid ? "Address is in service area" : "Address is outside service area"
            ));

        } catch (Exception e) {
            logger.error("Error validating address: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error validating address: " + e.getMessage()));
        }
    }

    /**
     * Find nearby places of a specific type.
     * 
     * GET /api/locations/nearby?lat=-33.93&lon=18.42&type=restaurant&radius=2&limit=10
     * 
     * @param latitude Center latitude
     * @param longitude Center longitude
     * @param type Place type (e.g., restaurant, cafe, store)
     * @param radius Search radius in kilometers (default 2)
     * @param limit Maximum number of results (default 10)
     * @return List of AddressDto
     */
    @GetMapping("/nearby")
    public ResponseEntity<?> getNearbyPlaces(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "restaurant") String type,
            @RequestParam(defaultValue = "2") Double radius,
            @RequestParam(defaultValue = "10") int limit) {

        try {
            if (latitude == null || longitude == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Latitude and longitude are required"));
            }

            if (!GeoLocationUtil.isValidCoordinate(latitude, longitude)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid coordinates"));
            }

            List<AddressDto> places = googleMapsService.findNearbyPlaces(
                latitude, longitude, type, radius, limit
            );

            return ResponseEntity.ok(Map.of(
                "places", places,
                "count", places.size(),
                "searchRadius", radius,
                "searchType", type
            ));

        } catch (Exception e) {
            logger.error("Error finding nearby places: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error finding places: " + e.getMessage()));
        }
    }

    /**
     * Check if a point is within a circular geofence.
     * 
     * GET /api/locations/geofence?centerLat=-33.93&centerLon=18.42&pointLat=-33.94&pointLon=18.43&radiusKm=5
     * 
     * @return Map with isWithin, distance, etc.
     */
    @GetMapping("/geofence")
    public ResponseEntity<?> checkGeofence(
            @RequestParam Double centerLat,
            @RequestParam Double centerLon,
            @RequestParam Double pointLat,
            @RequestParam Double pointLon,
            @RequestParam(defaultValue = "5") Double radiusKm) {

        try {
            if (centerLat == null || centerLon == null || pointLat == null || pointLon == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "All coordinates are required"));
            }

            BigDecimal distance = GeoLocationUtil.calculateDistanceKm(centerLat, centerLon, pointLat, pointLon);
            boolean isWithin = GeoLocationUtil.isWithinRadius(centerLat, centerLon, pointLat, pointLon, radiusKm);

            return ResponseEntity.ok(Map.of(
                "isWithin", isWithin,
                "distanceKm", distance,
                "radiusKm", radiusKm,
                "message", isWithin ? "Point is within geofence" : "Point is outside geofence"
            ));

        } catch (Exception e) {
            logger.error("Error checking geofence: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error checking geofence: " + e.getMessage()));
        }
    }

    // ── Helper Methods ────────────────────────────────────────────────────────

    private double getAverageSpeedForMode(String mode) {
        return switch (mode.toLowerCase()) {
            case "walking" -> 5.0;
            case "bicycling" -> 15.0;
            case "transit" -> 25.0;
            case "driving" -> 30.0;
            default -> 30.0;
        };
    }
}
