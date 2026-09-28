package org.example.duwaz.service;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GoogleMapsServiceTest {

    @Test
    void fallbackSuggestionsIncludeLandmarksForCapeTownQueries() {
        GoogleMapsService service = new GoogleMapsService();
        ReflectionTestUtils.setField(service, "googleMapsEnabled", false);

        var suggestions = service.getAddressAutocompleteSuggestions("castle", null, null);

        assertFalse(suggestions.isEmpty());
        assertTrue(suggestions.stream().anyMatch(s ->
                s.getDescription() != null && s.getDescription().toLowerCase().contains("castle")));

        var waterfrontSuggestions = service.getAddressAutocompleteSuggestions("v&a", null, null);
        assertFalse(waterfrontSuggestions.isEmpty());
        assertTrue(waterfrontSuggestions.stream().anyMatch(s ->
                s.getDescription() != null && s.getDescription().toLowerCase().contains("waterfront")));
    }

    @Test
    void fallbackSuggestionsMatchQueryAndDoNotReturnUnrelatedLocations() {
        GoogleMapsService service = new GoogleMapsService();
        ReflectionTestUtils.setField(service, "googleMapsEnabled", false);

        var observatorySuggestions = service.getAddressAutocompleteSuggestions("obs", null, null);
        assertTrue(observatorySuggestions.stream().anyMatch(s ->
                s.getDescription() != null && s.getDescription().toLowerCase().contains("observatory")));

        var unrelatedSuggestions = service.getAddressAutocompleteSuggestions("xyz nowhere", null, null);
        assertTrue(unrelatedSuggestions.isEmpty());

        var shortTokenSuggestions = service.getAddressAutocompleteSuggestions("x y", null, null);
        assertTrue(shortTokenSuggestions.isEmpty());
    }

    @Test
    void fallbackSuggestionsIncludeCputResidences() {
        GoogleMapsService service = new GoogleMapsService();
        ReflectionTestUtils.setField(service, "googleMapsEnabled", false);

        var cputResidenceSuggestions = service.getAddressAutocompleteSuggestions("cput residence", null, null);
        assertFalse(cputResidenceSuggestions.isEmpty());
        assertTrue(cputResidenceSuggestions.stream().anyMatch(s ->
                s.getDescription() != null && s.getDescription().toLowerCase().contains("cput")
                        && s.getDescription().toLowerCase().contains("residence")));

        var zonnebloemResidenceSuggestions = service.getAddressAutocompleteSuggestions("zonnebloem residence", null, null);
        assertFalse(zonnebloemResidenceSuggestions.isEmpty());
        assertTrue(zonnebloemResidenceSuggestions.stream().anyMatch(s ->
                s.getDescription() != null && s.getDescription().toLowerCase().contains("zonnebloem")
                        && s.getDescription().toLowerCase().contains("residence")));
    }

    @Test
    void fallbackSuggestionsIncludeOtherCapeTownResidencesAndCampusAreas() {
        GoogleMapsService service = new GoogleMapsService();
        ReflectionTestUtils.setField(service, "googleMapsEnabled", false);

        var residenceSuggestions = service.getAddressAutocompleteSuggestions("tugwell residence", null, null);
        assertTrue(residenceSuggestions.stream().anyMatch(s ->
                s.getDescription() != null && s.getDescription().toLowerCase().contains("tugwell")));

        var residenceNameSuggestions = service.getAddressAutocompleteSuggestions("liesbeeck gardens", null, null);
        assertTrue(residenceNameSuggestions.stream().anyMatch(s ->
                s.getDescription() != null && s.getDescription().toLowerCase().contains("liesbeeck gardens")));

        var bellvilleSuggestions = service.getAddressAutocompleteSuggestions("bellville", null, null);
        assertTrue(bellvilleSuggestions.stream().anyMatch(s ->
                s.getDescription() != null && s.getDescription().toLowerCase().contains("bellville")));

        var bellvilleAddress = service.geocodeAddress("Bellville, 7530, Cape Town, South Africa");
        assertTrue(bellvilleAddress.getFormattedAddress().toLowerCase().contains("bellville"));
        assertFalse(bellvilleAddress.getFormattedAddress().toLowerCase().contains("cbd"));
    }

    @Test
    void fallbackSuggestionsIncludeStreetNamesAndBuildingNumbers() {
        GoogleMapsService service = new GoogleMapsService();
        ReflectionTestUtils.setField(service, "googleMapsEnabled", false);

        var longStreetSuggestions = service.getAddressAutocompleteSuggestions("Long Street 42", null, null);
        assertFalse(longStreetSuggestions.isEmpty());
        assertTrue(longStreetSuggestions.stream().anyMatch(s ->
                s.getDescription() != null && s.getDescription().toLowerCase().contains("long street 42")));

        var buitenkantSuggestions = service.getAddressAutocompleteSuggestions("Buitenkant Street 12", null, null);
        assertFalse(buitenkantSuggestions.isEmpty());
        assertTrue(buitenkantSuggestions.stream().anyMatch(s ->
                s.getDescription() != null && s.getDescription().toLowerCase().contains("buitenkant street 12")));
    }
}
