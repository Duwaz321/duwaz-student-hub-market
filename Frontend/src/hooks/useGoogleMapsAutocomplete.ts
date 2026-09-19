import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from './use-toast';

export interface AddressSuggestion {
  placeId: string;
  mainText: string;
  secondaryText?: string;
  description: string;
  types?: string[];
  latitude?: number;
  longitude?: number;
}

export interface AddressDetails {
  formattedAddress: string;
  streetAddress?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  province?: string;
  latitude: number;
  longitude: number;
  placeId?: string;
  addressType?: string;
  isGeocoded?: boolean;
  geocodingProvider?: string;
}

/**
 * Hook for Google Maps address autocomplete.
 * 
 * Usage:
 * const {
 *   input,
 *   suggestions,
 *   selectedAddress,
 *   isLoading,
 *   error,
 *   setInput,
 *   selectSuggestion,
 *   clearSuggestions,
 *   getCurrentLocation
 * } = useGoogleMapsAutocomplete();
 */
export const useGoogleMapsAutocomplete = () => {
  const { toast } = useToast();
  const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<AddressDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Debounce timer ref
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Current location (for biasing autocomplete results)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number } | null>(null);

  /**
   * Fetch autocomplete suggestions from backend
   */
  const fetchAutocompleteSuggestions = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        input: query,
        ...(currentLocation && {
          latitude: String(currentLocation.lat),
          longitude: String(currentLocation.lon),
        }),
      });

      const response = await fetch(`${API_BASE_URL}/api/locations/autocomplete?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch suggestions');
      }

      setSuggestions(data.predictions || []);
    } catch (err) {
      console.error('Autocomplete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to get suggestions');
      setSuggestions([]);
      
      // Show fallback suggestions if API fails
      if (query.toLowerCase().includes('obs')) {
        setSuggestions([
          {
            placeId: 'fallback-obs',
            description: 'Observatory, Cape Town, South Africa',
            mainText: 'Observatory',
            secondaryText: 'Cape Town, South Africa',
            types: ['locality', 'political'],
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentLocation]);

  /**
   * Handle input change with debouncing
   */
  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    setError(null);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer (300ms debounce)
    debounceTimer.current = setTimeout(() => {
      fetchAutocompleteSuggestions(value);
    }, 300);
  }, [fetchAutocompleteSuggestions]);

  /**
   * Select a suggestion and fetch full details
   */
  const selectSuggestion = useCallback(async (suggestion: AddressSuggestion) => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch full details from backend
      const response = await fetch(`${API_BASE_URL}/api/locations/place/${suggestion.placeId}`);
      const details = await response.json();

      if (!response.ok) {
        throw new Error(details.error || 'Failed to get address details');
      }

      setSelectedAddress(details);
      setInput(details.formattedAddress);
      setSuggestions([]);

      return details;
    } catch (err) {
      console.error('Error selecting suggestion:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to get address details';
      setError(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Geocode an address string
   */
  const geocodeAddress = useCallback(async (address: string): Promise<AddressDetails | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/locations/geocode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      const details = await response.json();

      if (!response.ok) {
        throw new Error(details.error || 'Failed to geocode address');
      }

      setSelectedAddress(details);
      return details;
    } catch (err) {
      console.error('Error geocoding:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to geocode address';
      setError(errorMsg);
      toast({
        title: 'Geocoding Error',
        description: errorMsg,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, toast]);

  /**
   * Get current location using browser geolocation API
   */
  const getCurrentLocation = useCallback(async () => {
    return new Promise<{ lat: number; lon: number } | null>((resolve) => {
      if (!navigator.geolocation) {
        console.warn('Geolocation not supported');
        toast({
          title: 'Geolocation not supported',
          description: 'Your browser does not support geolocation',
          variant: 'destructive',
        });
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          setCurrentLocation(location);
          resolve(location);
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            title: 'Location access denied',
            description: 'Unable to access your location. Please enable location permissions.',
            variant: 'destructive',
          });
          resolve(null);
        },
        {
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }, [geocodeAddress, toast]);

  /**
   * Validate if address is in service area
   */
  const validateAddress = useCallback(async (address: string | AddressDetails) => {
    setIsLoading(true);
    setError(null);

    try {
      const addressString = typeof address === 'string' ? address : address.formattedAddress;

      const response = await fetch(`${API_BASE_URL}/api/locations/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: addressString }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to validate address');
      }

      return result;
    } catch (err) {
      console.error('Error validating address:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to validate address';
      setError(errorMsg);
      return { isValid: false, message: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Calculate distance between two addresses
   */
  const calculateDistance = useCallback(async (
    fromAddress: string,
    toAddress: string,
    mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/locations/distance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAddress,
          toAddress,
          mode,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to calculate distance');
      }

      return result;
    } catch (err) {
      console.error('Error calculating distance:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to calculate distance';
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear suggestions
   */
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  /**
   * Clear selection
   */
  const clearSelection = useCallback(() => {
    setSelectedAddress(null);
    setInput('');
    setSuggestions([]);
    setError(null);
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    // State
    input,
    suggestions,
    selectedAddress,
    isLoading,
    error,
    currentLocation,

    // Methods
    setInput: handleInputChange,
    selectSuggestion,
    geocodeAddress,
    getCurrentLocation,
    validateAddress,
    calculateDistance,
    clearSuggestions,
    clearSelection,
  };
};
