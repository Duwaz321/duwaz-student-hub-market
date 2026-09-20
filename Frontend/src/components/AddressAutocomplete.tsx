import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Loader2, AlertCircle, CheckCircle2, Navigation } from 'lucide-react';
import { useGoogleMapsAutocomplete, AddressDetails, AddressSuggestion } from '@/hooks/useGoogleMapsAutocomplete';
import { cn } from '@/lib/utils';

interface AddressAutocompleteProps {
  value?: AddressDetails | null;
  onChange?: (address: AddressDetails) => void;
  onAddressChange?: (addressString: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  showCoordinates?: boolean;
  showValidation?: boolean;
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
}

/**
 * Address autocomplete component with Google Maps integration.
 * Provides address suggestions, geocoding, and validation.
 * 
 * Usage:
 * <AddressAutocomplete
 *   label="Delivery Address"
 *   placeholder="Enter your address..."
 *   value={selectedAddress}
 *   onChange={setSelectedAddress}
 *   showCoordinates={true}
 *   showValidation={true}
 * />
 */
export const AddressAutocomplete = React.forwardRef<
  HTMLDivElement,
  AddressAutocompleteProps
>(({
  value,
  onChange,
  onAddressChange,
  placeholder = 'Enter address...',
  label,
  required = false,
  showCoordinates = false,
  showValidation = true,
  disabled = false,
  className,
  containerClassName,
}, ref) => {
  const {
    input,
    suggestions,
    selectedAddress,
    isLoading,
    error,
    setInput,
    selectSuggestion,
    geocodeAddress,
    getCurrentLocation,
    validateAddress,
    clearSuggestions,
    clearSelection,
  } = useGoogleMapsAutocomplete();

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Sync external value with internal state
  useEffect(() => {
    if (value && value.formattedAddress !== input) {
      setInput(value.formattedAddress);
    }
  }, [value]);

  // Sync selected address with callbacks
  useEffect(() => {
    if (selectedAddress && selectedAddress !== value) {
      onChange?.(selectedAddress);
      onAddressChange?.(selectedAddress.formattedAddress);

      // Auto-validate if enabled
      if (showValidation) {
        handleValidate(selectedAddress);
      }
    }
  }, [selectedAddress]);

  // Handle input focus
  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = async (suggestion: AddressSuggestion) => {
    const address = await selectSuggestion(suggestion);
    if (address) {
      setShowSuggestions(false);
    }
  };

  // Handle address validation
  const handleValidate = async (address: AddressDetails) => {
    setIsValidating(true);
    try {
      const result = await validateAddress(address.formattedAddress);
      setValidationResult(result);
    } finally {
      setIsValidating(false);
    }
  };

  // Handle use current location
  const handleUseCurrentLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      setInput(`Loading address for ${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}...`);
      const address = await geocodeAddress(`${location.lat}, ${location.lon}`);
      if (address) {
        onChange?.(address);
        onAddressChange?.(address.formattedAddress);
      } else {
        setInput(`My Location (${location.lat.toFixed(4)}, ${location.lon.toFixed(4)})`);
      }
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        suggestionsRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={cn('w-full space-y-2', containerClassName)}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Input Field */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggestions(true);
              setValidationResult(null);
            }}
            onFocus={handleFocus}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            className={cn(
              'w-full h-11 pl-10 pr-12 rounded-lg border border-border bg-background text-foreground',
              'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-0',
              'focus:ring-duwaz-brown/25 focus:border-duwaz-brown transition-all',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-red-500 focus:ring-red-500/25',
              className
            )}
          />

          {/* Loading indicator */}
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-duwaz-brown animate-spin" />
          )}

          {/* Clear button or validation icon */}
          {!isLoading && input && !selectedAddress && (
            <button
              onClick={() => clearSelection()}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              type="button"
            >
              ✕
            </button>
          )}

          {selectedAddress && validationResult?.isValid && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
          )}

          {selectedAddress && validationResult && !validationResult.isValid && (
            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
          )}
        </div>

        {/* Location Button */}
        {!selectedAddress && !disabled && (
          <button
            onClick={handleUseCurrentLocation}
            className="absolute right-12 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-duwaz-brown hover:bg-muted rounded transition-colors"
            type="button"
            title="Use current location"
          >
            <Navigation className="h-4 w-4" />
          </button>
        )}

        {/* Error Message */}
        {error && (
          <div className="absolute top-full mt-1 left-0 right-0 text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {suggestions.map((suggestion, idx) => (
            <button
              key={`${suggestion.placeId}-${idx}`}
              onClick={() => handleSelectSuggestion(suggestion)}
              className={cn(
                'w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors',
                'flex flex-col gap-0.5'
              )}
              type="button"
            >
              <div className="font-medium text-sm text-foreground">
                {suggestion.mainText}
              </div>
              {suggestion.secondaryText && (
                <div className="text-xs text-muted-foreground">
                  {suggestion.secondaryText}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Selected Address Details */}
      {selectedAddress && (
        <div className="bg-muted/50 border border-border/50 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">{selectedAddress.formattedAddress}</p>
              {selectedAddress.city && (
                <p className="text-xs text-muted-foreground">
                  {selectedAddress.streetAddress && `${selectedAddress.streetAddress}, `}
                  {selectedAddress.city}
                  {selectedAddress.postalCode && ` ${selectedAddress.postalCode}`}
                </p>
              )}
            </div>
          </div>

          {/* Coordinates (if enabled) */}
          {showCoordinates && selectedAddress.latitude && selectedAddress.longitude && (
            <div className="text-xs text-muted-foreground pl-6">
              <code className="bg-background px-2 py-1 rounded">
                {selectedAddress.latitude.toFixed(4)}, {selectedAddress.longitude.toFixed(4)}
              </code>
            </div>
          )}

          {/* Validation Status */}
          {showValidation && validationResult && (
            <div className={cn(
              'text-xs pl-6 flex items-center gap-1',
              validationResult.isValid ? 'text-green-600' : 'text-red-600'
            )}>
              {validationResult.isValid ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{validationResult.message}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3" />
                  <span>{validationResult.message}</span>
                </>
              )}
            </div>
          )}

          {/* Validate Button (if not validated yet) */}
          {showValidation && !validationResult && (
            <button
              onClick={() => handleValidate(selectedAddress)}
              disabled={isValidating}
              className="ml-6 text-xs text-duwaz-brown hover:underline disabled:opacity-50"
              type="button"
            >
              {isValidating ? 'Validating...' : 'Validate address'}
            </button>
          )}
        </div>
      )}

      {/* No Suggestions Message */}
      {showSuggestions && suggestions.length === 0 && input.trim().length >= 3 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg p-3 text-center text-sm text-muted-foreground z-50">
          No suggestions found. Try entering a different address.
        </div>
      )}
    </div>
  );
});

AddressAutocomplete.displayName = 'AddressAutocomplete';

export default AddressAutocomplete;
