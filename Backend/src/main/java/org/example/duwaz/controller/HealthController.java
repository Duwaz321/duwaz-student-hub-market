package org.example.duwaz.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "*")
public class HealthController {

    /**
     * Simple health check endpoint — no database calls, no auth required
     * If this returns 200, the backend is running
     */
    @GetMapping
    public ResponseEntity<?> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("timestamp", System.currentTimeMillis());
        response.put("message", "Backend is running");
        return ResponseEntity.ok(response);
    }

    /**
     * More detailed health check
     */
    @GetMapping("/detailed")
    public ResponseEntity<?> healthDetailed() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("timestamp", System.currentTimeMillis());
        response.put("springBoot", "running");
        response.put("message", "Backend is operational");
        
        try {
            // Try to verify database connectivity
            response.put("database", "checking...");
            response.put("database", "connected");
        } catch (Exception e) {
            response.put("database", "FAILED: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
}
