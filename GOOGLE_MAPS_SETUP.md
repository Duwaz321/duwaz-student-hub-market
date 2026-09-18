# ⚡ Google Maps Quick Setup (5 minutes)

## Get Your API Key (2 minutes)

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Search for and enable these APIs:
   - **Geocoding API**
   - **Places API**
   - **Distance Matrix API** (optional)
   - **Maps JavaScript API** (if using maps visualization)

4. Create API Key:
   - Left sidebar → **Credentials**
   - **Create Credentials** → **API Key**
   - Copy the key

5. Restrict the key (important for security):
   - Click on your API key
   - Under **Application restrictions**: Select "IP addresses" and add your server IP
   - Under **API restrictions**: Select the APIs from step 3
   - Save

## Configure Backend (1 minute)

### Option A: Environment Variable (Recommended)

```bash
# Linux/Mac
export GOOGLE_MAPS_API_KEY=your_api_key_here

# Windows PowerShell
$env:GOOGLE_MAPS_API_KEY="your_api_key_here"

# Windows Command Prompt
set GOOGLE_MAPS_API_KEY=your_api_key_here

# Docker
docker run -e GOOGLE_MAPS_API_KEY=your_key_here ...
```

### Option B: Properties File

Add to `Backend/src/main/resources/application.properties`:

```properties
google.maps.enabled=true
google.maps.api.key=YOUR_API_KEY_HERE
google.maps.delivery.radius.km=5
google.maps.campus.latitude=-33.9249
google.maps.campus.longitude=18.4241
```

## Test It (2 minutes)

### 1. Start Backend
```bash
cd Backend
./mvnw.cmd spring-boot:run
```

### 2. Test Autocomplete
```bash
curl "http://localhost:8080/api/locations/autocomplete?input=Main&lat=-33.93&lon=18.42"
```

### 3. Test Geocoding
```bash
curl -X POST http://localhost:8080/api/locations/geocode \
  -H "Content-Type: application/json" \
  -d '{"address":"123 Main Street, Cape Town"}'
```

### 4. Test Distance
```bash
curl -X POST http://localhost:8080/api/locations/distance \
  -H "Content-Type: application/json" \
  -d '{"fromAddress":"Cape Town","toAddress":"Observatory","mode":"driving"}'
```

## Use in CartPage

Already integrated! Just make sure:

1. Backend is running with `GOOGLE_MAPS_API_KEY` set
2. Frontend is running
3. Navigate to cart and try entering an address

## Use in AccountPage (Optional)

Add to profile form:

```tsx
import { AddressAutocomplete } from '@/components/AddressAutocomplete';

<AddressAutocomplete
  label="Your Residence"
  placeholder="Where do you live?"
  value={profileAddress}
  onChange={(addr) => {
    setProfileAddress(addr);
    // Save to profile...
  }}
  showCoordinates={true}
  showValidation={true}
/>
```

## Verify It's Working

✅ **Autocomplete suggestions show up** - Click in address field and type "M"  
✅ **Address validates** - Selected address shows "in service area" message  
✅ **Coordinates display** - Shows latitude/longitude in green box  
✅ **Dropdown closes** - Click outside suggestions to close  
✅ **Current location button works** - Browser geolocation permission dialog shows  

## Troubleshooting

| Problem | Solution |
|---------|----------|
| No suggestions appear | Check `GOOGLE_MAPS_API_KEY` is set, APIs are enabled |
| "Address not found" | Try simpler address like just city name "Cape Town" |
| Network errors | Check backend is running, check browser console for CORS errors |
| Slow response | Normal first time; results are cached after 24 hours |
| Blank page | Check backend logs for errors |

## Cost Estimate

**Free tier includes:**
- 25,000 autocomplete requests/month
- 40,000 geocoding requests/month
- 2,500 distance matrix queries/month

**Expected usage for small app:**
- ~500 users × 10 addresses/month = 5,000 geocoding requests/month ✅ FREE
- ~100 active users × 5 distance queries = 500 distance queries/month ✅ FREE

**Total expected cost:** ~$0-5/month for typical usage

## Next Steps

1. ✅ Set `GOOGLE_MAPS_API_KEY` environment variable
2. ✅ Test autocomplete in CartPage
3. ✅ Test address validation
4. ✅ Optional: Add to AccountPage profile
5. ✅ Deploy to production

**Done! You now have Google Maps address autocomplete with accurate geocoding and distance calculations.**
