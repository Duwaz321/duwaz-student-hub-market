package org.example.duwaz.service;

import org.example.duwaz.classesFolder.PushSubscription;
import org.example.duwaz.classesFolder.Student;
import org.example.duwaz.dto.PushNotificationDto;
import org.example.duwaz.dto.PushSubscriptionDto;
import org.example.duwaz.repo.PushSubscriptionRepository;
import org.example.duwaz.repo.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PushNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(PushNotificationService.class);

    private final PushSubscriptionRepository subscriptionRepository;
    private final StudentRepository studentRepository;

    public PushNotificationService(PushSubscriptionRepository subscriptionRepository,
                                   StudentRepository studentRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.studentRepository = studentRepository;
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
        try {
            // TODO: Implement actual push delivery using:
            // 1. WebPush library with VAPID keys
            // 2. Firebase Cloud Messaging
            // 3. Other push notification service

            // For now, log the notification
            logger.info("Pushing notification to endpoint: {} - Title: {}", 
                    subscription.getEndpoint(), notification.getTitle());

            // Update last active timestamp
            subscription.setLastActive(java.time.LocalDateTime.now());
            subscriptionRepository.save(subscription);
        } catch (Exception e) {
            logger.error("Failed to push notification to endpoint: {}", subscription.getEndpoint(), e);
            // Mark subscription as inactive if push fails (endpoint expired)
            subscription.setActive(false);
            subscriptionRepository.save(subscription);
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
