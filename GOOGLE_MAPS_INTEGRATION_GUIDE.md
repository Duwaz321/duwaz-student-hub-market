# 🗺️ Google Maps Integration Guide for Duwaz Marketplace

## Overview

This guide covers the complete Google Maps integration for address autocomplete, geocoding, distance calculations, and geolocation services in the Duwaz marketplace platform.

**What's Included:**
- ✅ Address autocomplete with suggestions
- ✅ Geocoding (address → coordinates)
- ✅ Distance calculations (Haversine formula + Google Distance Matrix API support)
- ✅ Geofence checking (circular and rectangular)
- ✅ Nearby places search
- ✅ Address validation and service area checking
- ✅ Multiple travel modes (driving, walking, bicycling, transit)
- ✅ Estimated delivery time calculations
- ✅ Live driver tracking with coordinates

---

## 🚀 Quick Start (5 minutes)

### Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - **Geocoding API** (for address → coordinates)
   - **Places API** (for autocomplete suggestions)
   - **Distance Matrix API** (optional, for accurate travel time)
   - **Maps JavaScript API** (if using map visualization)
4. Create an API key:
   - Go to **Credentials** → **Create Credentials** → **API Key**
   - Restrict to:
     - **Application restrictions**: Server IP (your backend server)
     - **API restrictions**: Geocoding API, Places API, Distance Matrix API
5. Copy your API key

### Step 2: Configure Backend

Add to `Backend/src/main/resources/application.properties`:

```properties
# Google Maps API Configuration
google.maps.enabled=true
google.maps.api.key=YOUR_API_KEY_HERE
google.maps.delivery.radius.km=5
google.maps.nearby.stores.radius.km=2
google.maps.campus.latitude=-33.9249
google.maps.campus.longitude=18.4241
```

Or use environment variable:
```bash
export GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

### Step 3: Use in Components

**In CartPage (delivery address):**
```tsx
import { AddressAutocomplete } from '@/components/AddressAutocomplete';

<AddressAutocomplete
  label="Delivery Address"
  placeholder="Start typing your address..."
  value={customAddress}
  onChange={(addr) => setCustomAddress(addr)}
  showValidation={true}
  required={true}
/>
```

**In AccountPage (profile location):**
```tsx
<AddressAutocomplete
  label="Your Residence"
  placeholder="Where do you live?"
  value={profileAddress}
  onChange={(addr) => setProfileAddress(addr)}
  showCoordinates={true}
/>
```

---

## 🏗️ Architecture

### Backend Components

#### 1. **GeoLocationUtil** (`util/GeoLocationUtil.java`)
Pure Java geolocation utilities using Haversine formula.

**Key Methods:**
- `calculateDistanceKm(lat1, lon1, lat2, lon2)` → distance in km
- `calculateBearing(lat1, lon1, lat2, lon2)` → bearing in degrees (0-360)
- `isWithinRadius(centerLat, centerLon, pointLat, pointLon, radiusKm)` → boolean
- `isWithinBoundingBox(centerLat, centerLon, boxSizeKm, pointLat, pointLon)` → boolean
- `estimateDeliveryTimeMinutes(distanceKm, averageSpeedKmH)` → int
- `calculateMidpoint(lat1, lon1, lat2, lon2)` → [centerLat, centerLon]
- `findClosestLocation(refLat, refLon, locations)` → closest index
- `sortByDistance(refLat, refLon, locations)` → sorted indices

**Example Usage:**
```java
// Calculate distance from user to shop
BigDecimal distanceKm = GeoLocationUtil.calculateDistanceKm(
    userLat, userLon, shopLat, shopLon
);

// Check if delivery is within service radius
boolean canDeliver = GeoLocationUtil.isWithinRadius(
    campusLat, campusLon, 
    deliveryLat, deliveryLon,
    5.0  // 5 km radius
);

// Estimate delivery time
int timeMinutes = GeoLocationUtil.estimateDeliveryTimeMinutes(
    distanceKm, 30.0  // 30 km/h average speed
);
```

#### 2. **GoogleMapsService** (`service/GoogleMapsService.java`)
Main Google Maps API integration service.

**Key Methods:**
- `geocodeAddress(addressString)` → AddressDto with coordinates
- `getAddressAutocompleteSuggestions(input, lat, lon)` → List<AddressSuggestionDto>
- `getPlaceDetails(placeId)` → AddressDto with full details
- `calculateDistance(fromAddress, toAddress, mode)` → Map with distance & duration
- `validateAddress(address)` → boolean
- `isAddressInServiceArea(address)` → boolean
- `findNearbyPlaces(lat, lon, type, radiusKm, maxResults)` → List<AddressDto>

**Configuration:**
```properties
google.maps.enabled=true                          # Enable/disable API calls
google.maps.api.key=YOUR_KEY                      # API key
google.maps.session.tokens.enabled=true           # Session tokens (billing optimization)
google.maps.delivery.radius.km=5                  # Max delivery distance
google.maps.rate.limit.enabled=true               # Rate limiting
google.maps.rate.limit.requests.per.minute=100    # Requests per minute
google.maps.geocoding.cache.enabled=true          # Cache geocoding results
google.maps.geocoding.cache.ttl.hours=24          # Cache TTL
```

#### 3. **LocationController** (`controller/LocationController.java`)
REST API endpoints for location services.

**Endpoints:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/locations/autocomplete?input=X&lat=Y&lon=Z` | Get address suggestions |
| GET | `/api/locations/place/{placeId}` | Get full place details |
| POST | `/api/locations/geocode` | Geocode address to coordinates |
| POST | `/api/locations/distance` | Calculate distance between addresses |
| GET | `/api/locations/distance/coords` | Distance between coordinates (fast) |
| POST | `/api/locations/validate` | Check if address in service area |
| GET | `/api/locations/nearby` | Find nearby places |
| GET | `/api/locations/geofence` | Check if point in geofence |

#### 4. **DTOs**

**AddressDto** - Complete address with geocoding:
```java
public class AddressDto {
    String formattedAddress;      // "123 Main St, Cape Town, 8000, SA"
    String streetAddress;         // "123 Main St"
    String city;                  // "Cape Town"
    String postalCode;            // "8000"
    String country;               // "South Africa"
    String province;              // "Western Cape"
    Double latitude;              // -33.9249
    Double longitude;             // 18.4241
    String placeId;               // Google Place ID
    String addressType;           // ROOFTOP, RANGE_INTERPOLATED, etc.
    Boolean isGeocoded;           // true if verified by Google
    String geocodingProvider;     // "GOOGLE_MAPS", "USER_INPUT"
    Long geocodedAt;              // Timestamp
}
```

**AddressSuggestionDto** - Single autocomplete suggestion:
```java
public class AddressSuggestionDto {
    String placeId;               // Google Place ID
    String mainText;              // "123 Main Street"
    String secondaryText;         // "Cape Town, South Africa"
    String description;           // Full description
    String[] types;               // ["street_address", "geocode"]
    Double latitude;              // (populated after details fetch)
    Double longitude;
}
```

### Frontend Components

#### 1. **useGoogleMapsAutocomplete Hook** (`hooks/useGoogleMapsAutocomplete.ts`)
Custom React hook for address autocomplete logic.

**State:**
```typescript
{
  input: string;                           // User input
  suggestions: AddressSuggestion[];        // Dropdown suggestions
  selectedAddress: AddressDetails | null;  // Selected/geocoded address
  isLoading: boolean;                      // API loading state
  error: string | null;                    // Error message
  currentLocation: { lat, lon } | null;    // Browser geolocation
}
```

**Methods:**
```typescript
setInput(value: string)                    // Update input (debounced)
selectSuggestion(suggestion)               // Select from dropdown
geocodeAddress(address: string)            // Geocode address string
getCurrentLocation()                       // Get browser location
validateAddress(address)                   // Check service area
calculateDistance(from, to, mode)          // Distance between addresses
clearSuggestions()                         // Clear dropdown
clearSelection()                           // Clear all
```

**Usage:**
```typescript
const {
  input,
  suggestions,
  selectedAddress,
  isLoading,
  error,
  setInput,
  selectSuggestion,
  getCurrentLocation,
  validateAddress,
  calculateDistance,
  clearSuggestions,
  clearSelection,
} = useGoogleMapsAutocomplete();
```

#### 2. **AddressAutocomplete Component** (`components/AddressAutocomplete.tsx`)
Complete React component for address input with autocomplete.

**Props:**
```typescript
interface AddressAutocompleteProps {
  value?: AddressDetails | null;        // Selected address
  onChange?: (address: AddressDetails) => void;
  onAddressChange?: (addressString: string) => void;
  placeholder?: string;                 // Input placeholder
  label?: string;                       // Label text
  required?: boolean;                   // Mark as required
  showCoordinates?: boolean;             // Show lat/lon
  showValidation?: boolean;              // Show validation status
  disabled?: boolean;                   // Disable input
  className?: string;                  // Input class
  containerClassName?: string;          // Container class
}
```

**Features:**
- Dropdown suggestions with click outside detection
- Geocoding on selection
- Service area validation
- Current location button
- Coordinates display
- Loading states and error messages
- Debounced input (300ms)
- Clean UI with Lucide icons

**Example:**
```tsx
<AddressAutocomplete
  label="Delivery Address"
  placeholder="Start typing..."
  value={selectedAddress}
  onChange={(addr) => setSelectedAddress(addr)}
  showCoordinates={true}
  showValidation={true}
  required={true}
/>
```

---

## 📡 API Endpoints Reference

### Get Address Autocomplete Suggestions

**Request:**
```bash
GET /api/locations/autocomplete?input=123%20Main&lat=-33.93&lon=18.42
```

**Response:**
```json
{
  "predictions": [
    {
      "placeId": "ChIJ...",
      "description": "123 Main Street, Cape Town, South Africa",
      "mainText": "123 Main Street",
      "secondaryText": "Cape Town, South Africa",
      "types": ["street_address", "geocode"]
    }
  ],
  "count": 1
}
```

### Geocode Address

**Request:**
```bash
POST /api/locations/geocode
Content-Type: application/json

{
  "address": "123 Main Street, Cape Town, South Africa"
}
```

**Response:**
```json
{
  "formattedAddress": "123 Main Street, Cape Town, 8000, South Africa",
  "streetAddress": "123 Main Street",
  "city": "Cape Town",
  "postalCode": "8000",
  "country": "South Africa",
  "province": "Western Cape",
  "latitude": -33.9249,
  "longitude": 18.4241,
  "placeId": "ChIJ...",
  "addressType": "ROOFTOP",
  "isGeocoded": true,
  "geocodingProvider": "GOOGLE_MAPS",
  "geocodedAt": 1692374523000
}
```

### Calculate Distance Between Addresses

**Request:**
```bash
POST /api/locations/distance
Content-Type: application/json

{
  "fromAddress": "123 Main Street, Cape Town",
  "toAddress": "456 High Street, Cape Town",
  "mode": "driving"
}
```

**Response:**
```json
{
  "distanceKm": 3.45,
  "distanceMeters": 3450,
  "durationSeconds": 720,
  "durationMinutes": 12,
  "mode": "driving"
}
```

### Calculate Distance Between Coordinates (Fast)

**Request:**
```bash
GET /api/locations/distance/coords?lat1=-33.93&lon1=18.42&lat2=-33.94&lon2=18.43&mode=driving
```

**Response:**
```json
{
  "distanceKm": 1.23,
  "distanceMeters": 1230,
  "durationSeconds": 240,
  "durationMinutes": 4,
  "bearingDegrees": 125.5,
  "mode": "driving"
}
```

### Validate Address (Check Service Area)

**Request:**
```bash
POST /api/locations/validate
Content-Type: application/json

{
  "address": "123 Main Street, Cape Town, South Africa"
}
```

**Response:**
```json
{
  "isValid": true,
  "address": "123 Main Street, Cape Town, 8000, South Africa",
  "latitude": -33.9249,
  "longitude": 18.4241,
  "message": "Address is in service area"
}
```

### Find Nearby Places

**Request:**
```bash
GET /api/locations/nearby?lat=-33.93&lon=18.42&type=restaurant&radius=2&limit=10
```

**Response:**
```json
{
  "places": [
    {
      "formattedAddress": "456 High Street, Cape Town, South Africa",
      "latitude": -33.9251,
      "longitude": 18.4250,
      "placeId": "ChIJ..."
    }
  ],
  "count": 1,
  "searchRadius": 2,
  "searchType": "restaurant"
}
```

### Check Geofence

**Request:**
```bash
GET /api/locations/geofence?centerLat=-33.93&centerLon=18.42&pointLat=-33.94&pointLon=18.43&radiusKm=5
```

**Response:**
```json
{
  "isWithin": true,
  "distanceKm": 1.23,
  "radiusKm": 5,
  "message": "Point is within geofence"
}
```

---

## 🧮 Geolocation Algorithms

### Haversine Formula (Distance Calculation)

Used for accurate great-circle distance between two points on Earth.

**Formula:**
```
a = sin²(Δφ/2) + cos(φ1) × cos(φ2) × sin²(Δλ/2)
c = 2 × atan2(√a, √(1−a))
d = R × c
```

Where:
- φ = latitude, λ = longitude
- R = Earth's radius (6371 km)
- Δφ = difference in latitude
- Δλ = difference in longitude

**Accuracy:** ±0.5% for most distances

**Java Implementation:**
```java
public static BigDecimal calculateDistanceKm(double lat1, double lon1, 
                                            double lat2, double lon2) {
    double dLat = Math.toRadians(lat2 - lat1);
    double dLon = Math.toRadians(lon2 - lon1);
    
    double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
               Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
               Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    double c = 2 * Math.asin(Math.sqrt(a));
    double distanceKm = 6371.0 * c;
    
    return new BigDecimal(distanceKm).setScale(2, RoundingMode.HALF_UP);
}
```

### Bearing Calculation

Angle from one point to another (compass bearing).

**Range:** 0° = North, 90° = East, 180° = South, 270° = West

**Java Implementation:**
```java
public static double calculateBearing(double lat1, double lon1, 
                                     double lat2, double lon2) {
    double dLon = Math.toRadians(lon2 - lon1);
    double y = Math.sin(dLon) * Math.cos(Math.toRadians(lat2));
    double x = Math.cos(Math.toRadians(lat1)) * Math.sin(Math.toRadians(lat2)) -
               Math.sin(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) * 
               Math.cos(dLon);
    double bearing = Math.toDegrees(Math.atan2(y, x));
    return (bearing + 360) % 360;  // Normalize to 0-360
}
```

### Geofence: Circular Check

Check if point is within circular radius.

**Java Implementation:**
```java
public static boolean isWithinRadius(double centerLat, double centerLon,
                                    double pointLat, double pointLon, 
                                    double radiusKm) {
    BigDecimal distance = calculateDistanceKm(centerLat, centerLon, 
                                             pointLat, pointLon);
    return distance.doubleValue() <= radiusKm;
}
```

### Geofence: Bounding Box Check

Faster rectangular geofence (less accurate).

**Java Implementation:**
```java
public static boolean isWithinBoundingBox(double centerLat, double centerLon,
                                         double boxSizeKm, double pointLat, 
                                         double pointLon) {
    // 1 degree ≈ 111 km
    double latOffset = boxSizeKm / 111.0;
    double lonOffset = boxSizeKm / (111.0 * Math.cos(Math.toRadians(centerLat)));
    
    return pointLat >= (centerLat - latOffset) && 
           pointLat <= (centerLat + latOffset) &&
           pointLon >= (centerLon - lonOffset) && 
           pointLon <= (centerLon + lonOffset);
}
```

### Delivery Time Estimation

Estimate delivery time based on distance and transport mode.

**Formula:**
```
time_minutes = ceil((distance_km / speed_kmh) × 60)
minimum_time = 5 minutes
```

**Speed by Mode:**
- Walking: 5 km/h
- Bicycling: 15 km/h
- Transit: 25 km/h (buses, trains)
- Driving: 30 km/h (urban with traffic)

**Java Implementation:**
```java
public static int estimateDeliveryTimeMinutes(BigDecimal distanceKm, 
                                             double averageSpeedKmH) {
    if (averageSpeedKmH <= 0) averageSpeedKmH = 30.0;
    double timeHours = distanceKm.doubleValue() / averageSpeedKmH;
    int timeMinutes = (int) Math.ceil(timeHours * 60);
    return Math.max(5, timeMinutes);  // Minimum 5 minutes
}
```

---

## 🔒 Security Considerations

### API Key Protection

1. **Never commit API key to Git:**
   ```bash
   # Use environment variable instead
   export GOOGLE_MAPS_API_KEY=your_key_here
   ```

2. **Restrict API Key in Google Cloud Console:**
   - Application restrictions: Restrict to your server IP
   - API restrictions: Only enable APIs you need
   - HTTP referrer restrictions: Add your domain(s)

3. **Rate Limiting:**
   ```properties
   google.maps.rate.limit.enabled=true
   google.maps.rate.limit.requests.per.minute=100
   ```

### Input Validation

Always validate coordinates and addresses:
```java
if (!GeoLocationUtil.isValidCoordinate(latitude, longitude)) {
    throw new InvalidArgumentException("Invalid coordinates");
}

if (!GeoLocationUtil.isWithinSouthAfrica(latitude, longitude)) {
    throw new ServiceAreaException("Address outside service area");
}
```

### Data Privacy

- Don't store unnecessary location data
- Cache geocoding results to reduce API calls
- Expire cached data after 24 hours
- Log only aggregated analytics, not individual addresses

---

## 🧪 Testing

### Unit Tests for Geolocation Utils

```java
@Test
public void testHaversineDistance() {
    // Cape Town to Observatory (approximately 3.8 km)
    BigDecimal distance = GeoLocationUtil.calculateDistanceKm(
        -33.9249, 18.4241,  // Cape Town
        -33.9380, 18.4728   // Observatory
    );
    assertTrue(distance.doubleValue() > 3.5 && distance.doubleValue() < 4.0);
}

@Test
public void testGeofenceRadius() {
    boolean isWithin = GeoLocationUtil.isWithinRadius(
        -33.9249, 18.4241,  // Center
        -33.9380, 18.4728,  // Point
        5.0                 // 5 km radius
    );
    assertTrue(isWithin);
}

@Test
public void testDeliveryTimeEstimate() {
    BigDecimal distanceKm = new BigDecimal("3.0");
    int timeMinutes = GeoLocationUtil.estimateDeliveryTimeMinutes(distanceKm, 30.0);
    assertEquals(6, timeMinutes);  // 3 km at 30 km/h = 6 minutes
}
```

### Integration Tests for API Endpoints

```bash
# Test autocomplete
curl "http://localhost:8080/api/locations/autocomplete?input=Main&lat=-33.93&lon=18.42"

# Test geocoding
curl -X POST http://localhost:8080/api/locations/geocode \
  -H "Content-Type: application/json" \
  -d '{"address":"123 Main Street, Cape Town"}'

# Test distance
curl -X POST http://localhost:8080/api/locations/distance \
  -H "Content-Type: application/json" \
  -d '{"fromAddress":"Cape Town","toAddress":"Observatory","mode":"driving"}'

# Test geofence
curl "http://localhost:8080/api/locations/geofence?centerLat=-33.93&centerLon=18.42&pointLat=-33.94&pointLon=18.43&radiusKm=5"
```

---

## 💡 Best Practices

### Performance

1. **Cache geocoding results:**
   ```properties
   google.maps.geocoding.cache.enabled=true
   google.maps.geocoding.cache.ttl.hours=24
   ```

2. **Use batch geocoding for multiple addresses** (not individual calls)

3. **Use fast coordinate distance endpoint** when you have coordinates:
   ```
   GET /api/locations/distance/coords  (fast, no API calls)
   POST /api/locations/distance        (slower, requires geocoding)
   ```

4. **Use session tokens for Places Autocomplete:**
   ```properties
   google.maps.session.tokens.enabled=true
   ```
   Reduces billing by grouping related requests

### UX

1. **Debounce autocomplete input** (300ms recommended)
2. **Show current location button** for convenience
3. **Display coordinates** if precise location matters
4. **Validate address in service area** before checkout
5. **Show estimated delivery time** after address selection

### Accuracy

1. **South Africa specific bounds:**
   - Latitude: -22 (north) to -35 (south)
   - Longitude: 16 (west) to 33 (east)

2. **Haversine formula vs Distance Matrix API:**
   - Haversine: Fast, ±0.5% accurate, no API cost
   - Distance Matrix: Slow, accurate, includes traffic, costs money
   - Use Haversine for real-time tracking, Distance Matrix for ETA

---

## 🐛 Troubleshooting

### "API key not valid"

1. Check API key is set in environment:
   ```bash
   echo $GOOGLE_MAPS_API_KEY
   ```

2. Verify APIs are enabled in Google Cloud Console

3. Check rate limits haven't been exceeded

### "Address not found"

1. Check address format (street, city, country)
2. Try without ZIP code
3. Verify coordinates are within service area
4. Check fallback geocoding is working

### Autocomplete not showing suggestions

1. Check `google.maps.enabled=true` in config
2. Verify input length ≥ 2 characters
3. Check network requests in DevTools
4. Ensure backend is running

### Slow distance calculations

1. Use coordinate endpoint instead of address endpoint
2. Enable caching for geocoding results
3. Use session tokens for Places Autocomplete
4. Consider batch requests for multiple addresses

---

## 📚 Additional Resources

- [Google Cloud Console](https://console.cloud.google.com/)
- [Geocoding API Docs](https://developers.google.com/maps/documentation/geocoding)
- [Places API Docs](https://developers.google.com/maps/documentation/places)
- [Distance Matrix API Docs](https://developers.google.com/maps/documentation/distance-matrix)
- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)

---

## ✅ Implementation Checklist

- [ ] Get Google Maps API key
- [ ] Enable required APIs in Google Cloud Console
- [ ] Set `GOOGLE_MAPS_API_KEY` environment variable
- [ ] Test backend endpoints with curl
- [ ] Integrate AddressAutocomplete in CartPage
- [ ] Integrate AddressAutocomplete in AccountPage
- [ ] Test address validation
- [ ] Verify distance calculations
- [ ] Test geofence checking
- [ ] Performance test with load
- [ ] Security review (API key restrictions)
- [ ] Deploy to production

