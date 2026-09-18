package org.example.duwaz.controller;

import org.example.duwaz.dto.PushNotificationDto;
import org.example.duwaz.dto.PushSubscriptionDto;
import org.example.duwaz.util.JwtUtil;
import org.example.duwaz.service.PushNotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.jsonwebtoken.Claims;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);

    private final PushNotificationService notificationService;
    private final JwtUtil jwtUtil;

    public NotificationController(PushNotificationService notificationService,
                                  JwtUtil jwtUtil) {
        this.notificationService = notificationService;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Subscribe user to push notifications
     * POST /api/notifications/subscribe
     */
    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody PushSubscriptionDto subscription) {
        try {
            // Extract user ID from JWT token
            String token = authHeader.replace("Bearer ", "");
            Claims claims = jwtUtil.extractAllClaims(token);
            Long userId = ((Number) claims.get("userId")).longValue();

            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Invalid token"));
            }

            notificationService.subscribe(userId, subscription);

            return ResponseEntity.ok(new SuccessResponse("Successfully subscribed to notifications"));
        } catch (Exception e) {
            logger.error("Failed to subscribe to notifications", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to subscribe: " + e.getMessage()));
        }
    }

    /**
     * Unsubscribe user from push notifications
     * POST /api/notifications/unsubscribe
     */
    @PostMapping("/unsubscribe")
    public ResponseEntity<?> unsubscribe(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody UnsubscribeRequest request) {
        try {
            // Extract user ID from JWT token (for logging, optional)
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtTokenProvider.getUserIdFromToken(token);

            notificationService.unsubscribe(request.getEndpoint());

            return ResponseEntity.ok(new SuccessResponse("Successfully unsubscribed from notifications"));
        } catch (Exception e) {
            logger.error("Failed to unsubscribe from notifications", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to unsubscribe: " + e.getMessage()));
        }
    }

    /**
     * Send notification to specific user (Admin/System use)
     * POST /api/notifications/send
     */
    @PostMapping("/send")
    public ResponseEntity<?> sendNotification(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody PushNotificationDto notification) {
        try {
            // Extract user ID from JWT token
            String token = authHeader.replace("Bearer ", "");
            Claims claims = jwtUtil.extractAllClaims(token);
            Long userId = ((Number) claims.get("userId")).longValue();

            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Invalid token"));
            }

            // Send notification to recipient
            notificationService.sendNotificationToStudent(notification.getRecipientId(), notification);

            return ResponseEntity.ok(new SuccessResponse("Notification sent"));
        } catch (Exception e) {
            logger.error("Failed to send notification", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to send notification: " + e.getMessage()));
        }
    }

    /**
     * Health check for notification service
     * GET /api/notifications/health
     */
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(new SuccessResponse("Notification service is running"));
    }

    // Helper classes
    public static class SuccessResponse {
        private String message;

        public SuccessResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

    public static class ErrorResponse {
        private String error;

        public ErrorResponse(String error) {
            this.error = error;
        }

        public String getError() {
            return error;
        }

        public void setError(String error) {
            this.error = error;
        }
    }

    public static class UnsubscribeRequest {
        private String endpoint;

        public UnsubscribeRequest() {}

        public UnsubscribeRequest(String endpoint) {
            this.endpoint = endpoint;
        }

        public String getEndpoint() {
            return endpoint;
        }

        public void setEndpoint(String endpoint) {
            this.endpoint = endpoint;
        }
    }
}
