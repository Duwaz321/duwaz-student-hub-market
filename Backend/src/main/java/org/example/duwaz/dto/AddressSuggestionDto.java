package org.example.duwaz.dto;

/**
 * Address suggestion returned by Google Maps Places Autocomplete API.
 * Represents a single suggestion from autocomplete predictions.
 */
public class AddressSuggestionDto {

    private String placeId;           // Google Place ID (unique identifier)
    private String mainText;          // Primary text (e.g., "123 Main Street")
    private String secondaryText;     // Secondary text (e.g., "Cape Town, South Africa")
    private String description;       // Full description (e.g., "123 Main Street, Cape Town, 8000, South Africa")
    private String[] types;           // Place types (e.g., ["street_address", "geocode"])
    private Double latitude;          // Predicted latitude (from Place Details call)
    private Double longitude;         // Predicted longitude (from Place Details call)

    // ── Constructors ──────────────────────────────────────────────────────────
    public AddressSuggestionDto() {}

    public AddressSuggestionDto(String placeId, String description) {
        this.placeId = placeId;
        this.description = description;
    }

    public AddressSuggestionDto(String placeId, String mainText, String secondaryText, 
                               String description, String[] types) {
        this.placeId = placeId;
        this.mainText = mainText;
        this.secondaryText = secondaryText;
        this.description = description;
        this.types = types;
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────
    public String getPlaceId() { return placeId; }
    public void setPlaceId(String placeId) { this.placeId = placeId; }

    public String getMainText() { return mainText; }
    public void setMainText(String mainText) { this.mainText = mainText; }

    public String getSecondaryText() { return secondaryText; }
    public void setSecondaryText(String secondaryText) { this.secondaryText = secondaryText; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String[] getTypes() { return types; }
    public void setTypes(String[] types) { this.types = types; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    @Override
    public String toString() {
        return "AddressSuggestionDto{" +
                "placeId='" + placeId + '\'' +
                ", description='" + description + '\'' +
                ", latitude=" + latitude +
                ", longitude=" + longitude +
                '}';
    }
}
