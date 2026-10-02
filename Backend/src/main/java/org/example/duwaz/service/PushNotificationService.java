package org.example.duwaz.service;

import org.example.duwaz.classesFolder.PushSubscription;
import org.example.duwaz.classesFolder.Student;
import org.example.duwaz.dto.PushNotificationDto;
import org.example.duwaz.dto.PushSubscriptionDto;
import org.example.duwaz.repo.PushSubscriptionRepository;
import org.example.duwaz.repo.StudentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.apache.http.HttpResponse;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.security.Security;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class PushNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(PushNotificationService.class);

    private final PushSubscriptionRepository subscriptionRepository;
    private final StudentRepository studentRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.push.vapid.public-key:}")
    private String vapidPublicKey;

    @Value("${app.push.vapid.private-key:}")
    private String vapidPrivateKey;

    @Value("${app.push.vapid.subject:mailto:support@duwaz.co.za}")
    private String vapidSubject;

    private PushService pushService;

    public PushNotificationService(PushSubscriptionRepository subscriptionRepository,
                                   StudentRepository studentRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.studentRepository = studentRepository;
    }

    @PostConstruct
    void initializeWebPush() {
        if (vapidPublicKey == null || vapidPublicKey.isBlank()
                || vapidPrivateKey == null || vapidPrivateKey.isBlank()) {
            logger.warn("Web Push is disabled: configure APP_PUSH_VAPID_PUBLIC_KEY and APP_PUSH_VAPID_PRIVATE_KEY.");
            return;
        }

        try {
            if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
                Security.addProvider(new BouncyCastleProvider());
            }
            pushService = new PushService(vapidPublicKey, vapidPrivateKey, vapidSubject);
            logger.info("Web Push initialized with VAPID configuration.");
        } catch (Exception e) {
            logger.error("Web Push VAPID configuration could not be initialized.", e);
        }
    }

    public String getVapidPublicKey() {
        return pushService == null ? null : vapidPublicKey;
    }

    public boolean hasActiveSubscription(Long studentId) {
        return studentRepository.findById(studentId)
                .map(student -> !subscriptionRepository.findByStudentAndActiveTrue(student).isEmpty())
                .orElse(false);
    }

    /**
     * Subscribe a student to push notifications
     */
    public void subscribe(Long studentId, PushSubscriptionDto subscriptionDto) {
        try {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new IllegalArgumentException("Student not found"));

            // Check if already subscribed
            subscriptionRepository.findByEndpoint(subscriptionDto.getEndpoint())
                    .ifPresent(sub -> subscriptionRepository.delete(sub));

            PushSubscription subscription = new PushSubscription(
                    student,
                    subscriptionDto.getEndpoint(),
                    subscriptionDto.getKeys() != null ? subscriptionDto.getKeys().getP256dh() : null,
                    subscriptionDto.getKeys() != null ? subscriptionDto.getKeys().getAuth() : null
            );

            subscriptionRepository.save(subscription);
            logger.info("Student {} subscribed to push notifications", studentId);
        } catch (Exception e) {
            logger.error("Failed to subscribe student to push notifications", e);
            throw new RuntimeException("Failed to subscribe to notifications", e);
        }
    }

    /**
     * Unsubscribe a student from push notifications
     */
    public void unsubscribe(String endpoint) {
        try {
            subscriptionRepository.deleteByEndpoint(endpoint);
            logger.info("Unsubscribed endpoint from push notifications");
        } catch (Exception e) {
            logger.error("Failed to unsubscribe from push notifications", e);
            throw new RuntimeException("Failed to unsubscribe from notifications", e);
        }
    }

    /**
     * Send push notification to a specific student
     * Note: This is a placeholder. In production, you would integrate with a service like:
     * - Firebase Cloud Messaging (FCM)
     * - Azure Notification Hubs
     * - Amazon SNS
     * - Custom VAPID implementation with WebPush library
     */
    @Async
    public void sendNotificationToStudent(Long studentId, PushNotificationDto notification) {
        try {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new IllegalArgumentException("Student not found"));

            List<PushSubscription> subscriptions = subscriptionRepository.findByStudentAndActiveTrue(student);

            if (subscriptions.isEmpty()) {
                logger.info("No active subscriptions for student {}", studentId);
                return;
            }

            for (PushSubscription subscription : subscriptions) {
                sendPushToSubscription(subscription, notification);
            }
        } catch (Exception e) {
            logger.error("Failed to send notification to student {}", studentId, e);
        }
    }

    /**
     * Send push notification to all students in a list
     */
    public void sendNotificationToStudents(List<Long> studentIds, PushNotificationDto notification) {
        studentIds.forEach(studentId -> sendNotificationToStudent(studentId, notification));
    }

    /**
     * Send broadcast notification to all subscribed users
     */
    public void sendBroadcastNotification(PushNotificationDto notification) {
        try {
            List<PushSubscription> subscriptions = subscriptionRepository.findByActiveTrue();

            if (subscriptions.isEmpty()) {
                logger.info("No active subscriptions to send broadcast to");
                return;
            }

            for (PushSubscription subscription : subscriptions) {
                sendPushToSubscription(subscription, notification);
            }
        } catch (Exception e) {
            logger.error("Failed to send broadcast notification", e);
        }
    }

    /**
     * Placeholder for actual push delivery
     * In production, this would use WebPush protocol or a service like FCM
     */
    private void sendPushToSubscription(PushSubscription subscription, PushNotificationDto notification) {
        if (pushService == null) return;
        try {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("title", notification.getTitle());
            payload.put("body", notification.getBody());
            payload.put("tag", notification.getType() + "-" + notification.getTargetId());
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("type", notification.getType());
            data.put("targetId", notification.getTargetId());
            data.put("shopId", notification.getShopId());
            if ("order".equals(notification.getType())) data.put("orderId", notification.getTargetId());
            if ("message".equals(notification.getType())) data.put("messageId", notification.getTargetId());
            payload.put("data", data);

            Notification webPush = new Notification(
                    subscription.getEndpoint(),
                    subscription.getP256dhKey(),
                    subscription.getAuthKey(),
                    objectMapper.writeValueAsString(payload).getBytes(StandardCharsets.UTF_8),
                    60 * 60 * 12);
            HttpResponse response = pushService.send(webPush);
            int status = response.getStatusLine().getStatusCode();
            if (status < 200 || status >= 300) {
                logger.warn("Push provider returned HTTP {} for subscription {}", status, subscription.getId());
                if (status == 404 || status == 410) {
                    subscription.setActive(false);
                    subscriptionRepository.save(subscription);
                }
                return;
            }
            subscription.setLastActive(java.time.LocalDateTime.now());
            subscriptionRepository.save(subscription);
        } catch (Exception e) {
            logger.error("Failed to send Web Push notification for subscription {}", subscription.getId(), e);
        }
    }

    /**
     * Clean up inactive subscriptions
     */
    public void cleanupInactiveSubscriptions() {
        try {
            List<PushSubscription> activeSubscriptions = subscriptionRepository.findByActiveTrue();
            java.time.LocalDateTime thirtyDaysAgo = java.time.LocalDateTime.now().minusDays(30);

            for (PushSubscription subscription : activeSubscriptions) {
                if (subscription.getLastActive() != null && subscription.getLastActive().isBefore(thirtyDaysAgo)) {
                    subscription.setActive(false);
                    subscriptionRepository.save(subscription);
                }
            }
            logger.info("Cleaned up inactive push subscriptions");
        } catch (Exception e) {
            logger.error("Failed to cleanup inactive subscriptions", e);
        }
    }
}
