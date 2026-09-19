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
}
