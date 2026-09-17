package org.example.duwaz.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.EntityManager;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "*")
public class HealthController {

    @Autowired(required = false)
    private EntityManager entityManager;

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
     * Database connectivity check — tries to query Supabase
     */
    @GetMapping("/db")
    public ResponseEntity<?> checkDatabase() {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", System.currentTimeMillis());
        
        try {
            if (entityManager == null) {
                response.put("database", "FAILED - EntityManager not available");
                return ResponseEntity.status(500).body(response);
            }

            // Execute a simple query to verify database connection
            Object result = entityManager.createNativeQuery("SELECT 1 as test")
                    .getSingleResult();
            
            response.put("status", "OK");
            response.put("database", "CONNECTED to Supabase PostgreSQL");
            response.put("testQuery", "SELECT 1 executed successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("status", "ERROR");
            response.put("database", "FAILED to connect to Supabase");
            response.put("error", e.getClass().getSimpleName());
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
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
            if (entityManager != null) {
                entityManager.createNativeQuery("SELECT 1 as test").getSingleResult();
                response.put("database", "connected");
            } else {
                response.put("database", "EntityManager unavailable");
            }
        } catch (Exception e) {
            response.put("database", "FAILED: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
}
