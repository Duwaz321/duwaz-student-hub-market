package org.example.duwaz.dto;

import java.math.BigDecimal;

/**
 * Complete address data structure with geocoding information.
 * Used for verified, geocoded addresses throughout the system.
 */
public class AddressDto {

    // ── Address Components ────────────────────────────────────────────────────
    private String formattedAddress;  // Full address as formatted by Google (e.g., "123 Main St, Cape Town, 8000, South Africa")
    private String streetAddress;     // Street number and name
    private String city;              // City/town
    private String postalCode;        // ZIP/postal code
    private String country;           // Country
    private String province;          // Province/state
    
    // ── Geocoding Coordinates ─────────────────────────────────────────────────
    private Double latitude;          // Geocoded latitude
    private Double longitude;         // Geocoded longitude
    private String placeId;           // Google Maps Place ID (for validation/lookup)
    
    // ── Accuracy & Metadata ──────────────────────────────────────────────────
    private String addressType;       // ROOFTOP, RANGE_INTERPOLATED, GEOMETRIC_CENTER, APPROXIMATE
    private Boolean isGeocoded;       // True if verified by Google Maps API
    private String geocodingProvider; // "GOOGLE_MAPS", "USER_INPUT", etc.
    private Long geocodedAt;          // Timestamp of geocoding
    
    // ── Constructors ──────────────────────────────────────────────────────────
    public AddressDto() {}
    
    public AddressDto(String formattedAddress, Double latitude, Double longitude) {
        this.formattedAddress = formattedAddress;
        this.latitude = latitude;
        this.longitude = longitude;
    }
    
    public AddressDto(String formattedAddress, String streetAddress, String city, 
                     String postalCode, String country, Double latitude, Double longitude) {
        this.formattedAddress = formattedAddress;
        this.streetAddress = streetAddress;
        this.city = city;
        this.postalCode = postalCode;
        this.country = country;
        this.latitude = latitude;
        this.longitude = longitude;
    }
    
    // ── Getters & Setters ─────────────────────────────────────────────────────
    public String getFormattedAddress() { return formattedAddress; }
    public void setFormattedAddress(String formattedAddress) { this.formattedAddress = formattedAddress; }
    
    public String getStreetAddress() { return streetAddress; }
    public void setStreetAddress(String streetAddress) { this.streetAddress = streetAddress; }
    
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    
    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
    
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    
    public String getProvince() { return province; }
    public void setProvince(String province) { this.province = province; }
    
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    
    public String getPlaceId() { return placeId; }
    public void setPlaceId(String placeId) { this.placeId = placeId; }
    
    public String getAddressType() { return addressType; }
    public void setAddressType(String addressType) { this.addressType = addressType; }
    
    public Boolean getIsGeocoded() { return isGeocoded; }
    public void setIsGeocoded(Boolean isGeocoded) { this.isGeocoded = isGeocoded; }
    
    public String getGeocodingProvider() { return geocodingProvider; }
    public void setGeocodingProvider(String geocodingProvider) { this.geocodingProvider = geocodingProvider; }
    
    public Long getGeocodedAt() { return geocodedAt; }
    public void setGeocodedAt(Long geocodedAt) { this.geocodedAt = geocodedAt; }
    
    @Override
    public String toString() {
        return "AddressDto{" +
                "formattedAddress='" + formattedAddress + '\'' +
                ", city='" + city + '\'' +
                ", latitude=" + latitude +
                ", longitude=" + longitude +
                ", isGeocoded=" + isGeocoded +
                '}';
    }
}
