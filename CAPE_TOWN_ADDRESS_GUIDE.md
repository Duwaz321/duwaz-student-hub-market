# Cape Town Address Autocomplete Improvement Guide

## Overview
The address autocomplete feature has been improved to provide better suggestions for Cape Town, specifically around **Cape Peninsula University of Technology (CPUT)** and surrounding areas.

## What Was Fixed

### 1. **Corrected Campus Coordinates**
- **CPUT Zonnebloem Campus** (Main): `-33.9636, 18.4133`
  - Located in District Six/Zonnebloem area
  - Known streets: Wale Street, Hanover Street, Constitution Street
  
- **CPUT City Campus** (De Waterkant): `-33.9250, 18.4167`
  - Located in Signal Hill/De Waterkant area
  - Known streets: Prestwich Street, Hans Strijdom Avenue

### 2. **Enhanced Autocomplete Suggestions**
The system now suggests addresses when users type keywords related to:

**CPUT Campus Areas:**
- "CPUT" → Suggests all CPUT campus locations
- "Zonnebloem" → Main campus area
- "Wale Street", "Hanover Street" → CPUT main campus streets
- "District Six" → Near main campus
- "De Waterkant", "Signal Hill" → CPUT City campus area
- "Prestwich Street" → City campus street

**Surrounding Residential Areas:**
- "Salt River" → Close to main campus
- "Woodstock" → Residential area near CPUT
- "Mowbray" → Student area
- "Rondebosch" → Residential area
- "Claremont" → Residential area
- "Observatory" → Popular student area
- "Camps Bay" → Scenic area
- "Newlands" → Residential area

### 3. **Improved Geocoding** 
When users enter an address containing CPUT or nearby area keywords, the system now:
- Automatically geocodes them to the correct Cape Town coordinates
- Returns proper latitude/longitude for mapping
- Supports delivery distance calculation
- Validates service area coverage

## How to Use

### On Profile Page (AccountPage)
1. Click on "Add Address" or "Edit Address"
2. Start typing address keywords like:
   - "CPUT"
   - "Observatory"
   - "Salt River"
   - "Wale Street"
3. Select from suggestions
4. Address is geocoded and saved

### During Checkout (CartPage)
1. Enter delivery address
2. Type Cape Town area keywords
3. Select suggested address
4. System validates delivery is within service area
5. Distance to shop is calculated

## Supported Keywords

### Campus Keywords
```
CPUT
Zonnebloem
City Campus
De Waterkant
Signal Hill
```

### Street Names
```
Wale Street
Hanover Street
Constitution Street
Dorp Street
Buitengracht Street
Prestwich Street
Hans Strijdom Avenue
```

### Area Keywords
```
Salt River
District Six
Schotsche Kloof
Woodstock
Observatory
Mowbray
Rondebosch
Claremont
Camps Bay
Newlands
```

## Technical Details

### Configuration
Location: `Backend/src/main/resources/application-maps.properties`

```properties
# CPUT Campus coordinates (for bias and geofencing)
google.maps.campus.latitude=-33.9636
google.maps.campus.longitude=18.4133

# Service area radius
google.maps.delivery.radius.km=5
google.maps.nearby.stores.radius.km=2
```

### API Endpoints

**Autocomplete Suggestions**
```
GET /api/locations/autocomplete?input=CPUT&latitude=-33.96&longitude=18.41
```

**Geocode Address**
```
POST /api/locations/geocode
{
  "address": "CPUT Zonnebloem Campus, Cape Town"
}
```

**Validate Address in Service Area**
```
POST /api/locations/validate
{
  "address": "123 Wale Street, District Six, Cape Town"
}
```

**Calculate Distance**
```
POST /api/locations/distance
{
  "fromAddress": "CPUT, Zonnebloem Campus",
  "toAddress": "Shop Address",
  "mode": "driving"
}
```

## Future Improvements

### Enable Google Maps API
To use real Google Maps data instead of fallback suggestions:

1. Get API Key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable these APIs:
   - Geocoding API
   - Places API (for autocomplete)
   - Distance Matrix API (optional)
   - Maps JavaScript API

3. Set in configuration or environment:
   ```bash
   export GOOGLE_MAPS_API_KEY="YOUR_API_KEY_HERE"
   export SPRING_PROFILES_ACTIVE=maps
   ```

4. Update `application.properties`:
   ```properties
   spring.profiles.active=maps
   ```

### Why Fallback is Used Now
- Reduces API quota costs during development
- Works offline for testing
- Provides consistent results for common CPUT area addresses
- Easy to expand with more keywords and locations

## Testing

### Test Cases

**Test 1: CPUT Campus Autocomplete**
1. Navigate to profile or checkout page
2. Type "CPUT" in address field
3. ✅ Should suggest "CPUT, Zonnebloem Campus, Cape Town, South Africa"
4. Select it
5. ✅ Should geocode to `-33.9636, 18.4133`

**Test 2: Observatory Area**
1. Type "Observatory" in address field
2. ✅ Should suggest Observatory addresses
3. Select one
4. ✅ Should geocode to `-33.9380, 18.4728`

**Test 3: District Six**
1. Type "District Six" in address field
2. ✅ Should suggest District Six addresses
3. ✅ Should geocode to CPUT main campus area

**Test 4: Partial Address**
1. Type "Wale" in address field
2. ✅ Should suggest "Wale Street, CPUT, Cape Town"
3. Select it
4. ✅ Should save and display on map

**Test 5: Delivery Distance**
1. Add address near CPUT
2. Add shop address
3. ✅ Should calculate distance and travel time
4. ✅ Should show "Delivery fee: R XX.XX"

## Example Addresses

These addresses work well with the current system:

```
✅ CPUT, Zonnebloem Campus, Cape Town, South Africa
✅ Wale Street, District Six, Cape Town, South Africa
✅ Hanover Street, Zonnebloem, Cape Town, South Africa
✅ Salt River, Cape Town, South Africa
✅ Observatory, Cape Town, South Africa
✅ Mowbray, Cape Town, South Africa
✅ Woodstock, Cape Town, South Africa
```

## Troubleshooting

### Address Not Found
- Try using campus name: "CPUT"
- Try area name: "Observatory", "Salt River"
- Try main street: "Wale Street", "Main Road"

### Coordinates Wrong
- Clear browser cache (Ctrl+Shift+Delete)
- Try full address: "123 Wale Street, District Six, Cape Town, South Africa"
- Contact support if persistent

### Distance Not Calculating
- Ensure both addresses are geocoded (have coordinates)
- Ensure delivery address is within 5km service area
- Try entering shop address manually

## Related Files
- `Backend/src/main/java/org/example/duwaz/service/GoogleMapsService.java` - Address geocoding logic
- `Backend/src/main/java/org/example/duwaz/controller/LocationController.java` - API endpoints
- `Backend/src/main/java/org/example/duwaz/util/GeoLocationUtil.java` - Distance calculations
- `Frontend/src/hooks/useGoogleMapsAutocomplete.ts` - Frontend autocomplete hook
- `Frontend/src/components/AddressAutocomplete.tsx` - Address autocomplete component

## Support
For issues or improvements, contact the development team with:
- Address you tried
- Error message (if any)
- Expected result vs actual result
