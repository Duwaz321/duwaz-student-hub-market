package org.example.duwaz.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Geolocation utilities for distance calculations, bearing, and location algorithms.
 * Uses Haversine formula for accurate distance calculations on Earth's surface.
 */
public class GeoLocationUtil {

    // ── Constants ─────────────────────────────────────────────────────────────
    private static final double EARTH_RADIUS_KM = 6371.0;           // Earth's mean radius in kilometers
    private static final double EARTH_RADIUS_M = 6371000.0;         // Earth's mean radius in meters
    private static final double PI = Math.PI;
    
    // ── Geofence defaults for campus/delivery zones ───────────────────────────
    public static final double DEFAULT_DELIVERY_RADIUS_KM = 5.0;    // Default delivery radius (5 km)
    public static final double DEFAULT_NEARBY_STORE_RADIUS_KM = 2.0; // Nearby stores search radius (2 km)

    /**
     * Calculate distance between two geographic coordinates using Haversine formula.
     * Accurate to within 0.5% for most use cases.
     *
     * @param lat1 Latitude of first point (degrees)
     * @param lon1 Longitude of first point (degrees)
     * @param lat2 Latitude of second point (degrees)
     * @param lon2 Longitude of second point (degrees)
     * @return Distance in kilometers (BigDecimal with 2 decimal places)
     *
     * @example
     * Distance from Cape Town (-33.9249, 18.4241) to Observatory (-33.9380, 18.4728) ≈ 3.8 km
     */
    public static BigDecimal calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.asin(Math.sqrt(a));
        double distanceKm = EARTH_RADIUS_KM * c;

        return new BigDecimal(distanceKm).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Calculate distance in meters between two points.
     */
    public static BigDecimal calculateDistanceMeters(double lat1, double lon1, double lat2, double lon2) {
        BigDecimal distanceKm = calculateDistanceKm(lat1, lon1, lat2, lon2);
        return distanceKm.multiply(new BigDecimal(1000)).setScale(0, RoundingMode.HALF_UP);
    }

    /**
     * Calculate bearing (angle) from one point to another.
     * Result is in degrees (0-360), where 0° = North, 90° = East, 180° = South, 270° = West.
     *
     * @param lat1 Latitude of starting point
     * @param lon1 Longitude of starting point
     * @param lat2 Latitude of destination point
     * @param lon2 Longitude of destination point
     * @return Bearing in degrees (0-360)
     */
    public static double calculateBearing(double lat1, double lon1, double lat2, double lon2) {
        double dLon = Math.toRadians(lon2 - lon1);
        double y = Math.sin(dLon) * Math.cos(Math.toRadians(lat2));
        double x = Math.cos(Math.toRadians(lat1)) * Math.sin(Math.toRadians(lat2)) -
                   Math.sin(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) * Math.cos(dLon);
        double bearing = Math.toDegrees(Math.atan2(y, x));
        return (bearing + 360) % 360;  // Normalize to 0-360
    }

    /**
     * Check if a point is within a circular radius.
     * Useful for geofencing delivery zones or finding nearby stores.
     *
     * @param centerLat Center latitude
     * @param centerLon Center longitude
     * @param pointLat Point latitude to check
     * @param pointLon Point longitude to check
     * @param radiusKm Search radius in kilometers
     * @return true if point is within radius
     */
    public static boolean isWithinRadius(double centerLat, double centerLon, 
                                        double pointLat, double pointLon, double radiusKm) {
        BigDecimal distance = calculateDistanceKm(centerLat, centerLon, pointLat, pointLon);
        return distance.doubleValue() <= radiusKm;
    }

    /**
     * Check if a point is within a bounding box (rectangular geofence).
     * Faster than radius check for many locations; less accurate.
     *
     * @param centerLat Center latitude
     * @param centerLon Center longitude
     * @param boxSizeKm Size of box in kilometers (distance from center to edge)
     * @param pointLat Point latitude to check
     * @param pointLon Point longitude to check
     * @return true if point is within bounding box
     */
    public static boolean isWithinBoundingBox(double centerLat, double centerLon, 
                                             double boxSizeKm, double pointLat, double pointLon) {
        // Rough conversion: 1 degree ≈ 111 km
        double latOffset = boxSizeKm / 111.0;
        double lonOffset = boxSizeKm / (111.0 * Math.cos(Math.toRadians(centerLat)));

        return pointLat >= (centerLat - latOffset) && pointLat <= (centerLat + latOffset) &&
               pointLon >= (centerLon - lonOffset) && pointLon <= (centerLon + lonOffset);
    }

    /**
     * Estimate delivery time based on distance.
     * Assumes average delivery speed of 30 km/h in urban areas (adjustable).
     *
     * @param distanceKm Distance in kilometers
     * @param averageSpeedKmH Average delivery speed (default 30 km/h for traffic)
     * @return Estimated delivery time in minutes
     */
    public static int estimateDeliveryTimeMinutes(BigDecimal distanceKm, double averageSpeedKmH) {
        if (averageSpeedKmH <= 0) averageSpeedKmH = 30.0;  // Default urban speed
        double timeHours = distanceKm.doubleValue() / averageSpeedKmH;
        int timeMinutes = (int) Math.ceil(timeHours * 60);
        return Math.max(5, timeMinutes);  // Minimum 5 minutes
    }

    /**
     * Calculate the center point between two coordinates (midpoint).
     * Useful for centering map on delivery route.
     *
     * @param lat1 Latitude of first point
     * @param lon1 Longitude of first point
     * @param lat2 Latitude of second point
     * @param lon2 Longitude of second point
     * @return [centerLat, centerLon]
     */
    public static double[] calculateMidpoint(double lat1, double lon1, double lat2, double lon2) {
        double dLon = Math.toRadians(lon2 - lon1);
        double bx = Math.cos(Math.toRadians(lat2)) * Math.cos(dLon);
        double by = Math.cos(Math.toRadians(lat2)) * Math.sin(dLon);

        double lat3 = Math.toDegrees(Math.atan2(
            Math.sin(Math.toRadians(lat1)) + Math.sin(Math.toRadians(lat2)),
            Math.sqrt((Math.cos(Math.toRadians(lat1)) + bx) * (Math.cos(Math.toRadians(lat1)) + bx) + by * by)
        ));

        double lon3 = Math.toDegrees(Math.toRadians(lon1) + Math.atan2(by, Math.cos(Math.toRadians(lat1)) + bx));

        return new double[]{lat3, lon3};
    }

    /**
     * Find the closest location from a list of locations.
     * Useful for finding nearest delivery driver or store.
     *
     * @param refLat Reference latitude
     * @param refLon Reference longitude
     * @param locations Array of [lat, lon] pairs
     * @return Index of closest location
     */
    public static int findClosestLocation(double refLat, double refLon, double[][] locations) {
        if (locations == null || locations.length == 0) return -1;

        int closestIdx = 0;
        BigDecimal minDistance = calculateDistanceKm(refLat, refLon, locations[0][0], locations[0][1]);

        for (int i = 1; i < locations.length; i++) {
            BigDecimal distance = calculateDistanceKm(refLat, refLon, locations[i][0], locations[i][1]);
            if (distance.compareTo(minDistance) < 0) {
                minDistance = distance;
                closestIdx = i;
            }
        }

        return closestIdx;
    }

    /**
     * Sort locations by distance from a reference point (bubble sort).
     * Returns indices in order of nearest to farthest.
     *
     * @param refLat Reference latitude
     * @param refLon Reference longitude
     * @param locations Array of [lat, lon] pairs
     * @return Array of indices sorted by distance
     */
    public static int[] sortByDistance(double refLat, double refLon, double[][] locations) {
        if (locations == null || locations.length == 0) return new int[0];

        int n = locations.length;
        int[] indices = new int[n];
        for (int i = 0; i < n; i++) indices[i] = i;

        // Calculate distances
        BigDecimal[] distances = new BigDecimal[n];
        for (int i = 0; i < n; i++) {
            distances[i] = calculateDistanceKm(refLat, refLon, locations[i][0], locations[i][1]);
        }

        // Bubble sort by distance
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (distances[j].compareTo(distances[j + 1]) > 0) {
                    // Swap
                    BigDecimal tmpDist = distances[j];
                    distances[j] = distances[j + 1];
                    distances[j + 1] = tmpDist;

                    int tmpIdx = indices[j];
                    indices[j] = indices[j + 1];
                    indices[j + 1] = tmpIdx;
                }
            }
        }

        return indices;
    }

    /**
     * Validate coordinates are in valid range.
     * Latitude: -90 to 90, Longitude: -180 to 180
     */
    public static boolean isValidCoordinate(double latitude, double longitude) {
        return latitude >= -90.0 && latitude <= 90.0 &&
               longitude >= -180.0 && longitude <= 180.0;
    }

    /**
     * Validate coordinates are within South Africa bounds (approximately).
     * Used for preventing invalid inputs outside service area.
     */
    public static boolean isWithinSouthAfrica(double latitude, double longitude) {
        // South Africa approximate bounds
        // Latitude: -22 (north) to -35 (south)
        // Longitude: 16 (west) to 33 (east)
        return latitude >= -35.0 && latitude <= -22.0 &&
               longitude >= 16.0 && longitude <= 33.0;
    }

    /**
     * Format coordinates as string for display.
     * @return "lat,lon" format (e.g., "-33.92,18.42")
     */
    public static String formatCoordinates(double latitude, double longitude) {
        return String.format("%.4f,%.4f", latitude, longitude);
    }

    /**
     * Parse coordinates from string format.
     * @param coordString "lat,lon" format
     * @return [lat, lon] or null if invalid
     */
    public static double[] parseCoordinates(String coordString) {
        try {
            String[] parts = coordString.split(",");
            if (parts.length != 2) return null;
            double lat = Double.parseDouble(parts[0].trim());
            double lon = Double.parseDouble(parts[1].trim());
            if (!isValidCoordinate(lat, lon)) return null;
            return new double[]{lat, lon};
        } catch (Exception e) {
            return null;
        }
    }
}
