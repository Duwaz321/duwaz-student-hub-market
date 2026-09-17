package org.example.duwaz.controller;

import org.example.duwaz.classesFolder.Message;
import org.example.duwaz.classesFolder.Order;
import org.example.duwaz.classesFolder.Student;
import org.example.duwaz.dto.WebSocketMessage;
import org.example.duwaz.repo.MessageRepository;
import org.example.duwaz.repo.OrderRepository;
import org.example.duwaz.repo.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import io.sentry.Sentry;
import java.security.Principal;

@Controller
public class WebSocketController {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketController.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private StudentRepository studentRepository;

    /**
     * Handle incoming messages from clients
     * Clients send to: /app/chat/order/{orderId}
     * Broadcasts to: /topic/order/{orderId}
     */
    @MessageMapping("/chat/order/{orderId}")
    public void handleMessage(@Payload WebSocketMessage message, Principal principal) {
        if (principal == null) {
            logger.warn("⚠️  WebSocket message received without authentication");
            return;
        }

        try {
            Long orderId = message.getOrderId();
            String senderEmail = principal.getName();

            // Verify order exists
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

            // Get sender details
            Student sender = studentRepository.findByEmail(senderEmail)
                    .orElseThrow(() -> new RuntimeException("Student not found: " + senderEmail));

            // Create persistent message in database
            Message dbMessage = new Message(order, sender, message.getContent());
            messageRepository.save(dbMessage);

            // Broadcast to all subscribers of this order's chat room
            message.setSenderId(sender.getId());
            message.setSenderName(sender.getStudentName());
            message.setOrderId(orderId);
            message.setTimestamp(dbMessage.getCreatedAt());
            message.setType("message");

            messagingTemplate.convertAndSend("/topic/order/" + orderId, message);
            
            logger.info("💬 Message sent to order {}: {} -> {}", orderId, senderEmail, message.getContent());

        } catch (Exception e) {
            logger.error("❌ WebSocket message error: {}", e.getMessage());
            Sentry.captureException(e);
        }
    }

    /**
     * Handle typing indicators
     * Clients send to: /app/typing/order/{orderId}
     * Broadcasts to: /topic/typing/{orderId}
     */
    @MessageMapping("/typing/order/{orderId}")
    public void handleTyping(@Payload WebSocketMessage message, Principal principal) {
        if (principal == null) return;

        try {
            Long orderId = message.getOrderId();
            Student sender = studentRepository.findByEmail(principal.getName()).orElse(null);
            if (sender == null) return;

            message.setSenderId(sender.getId());
            message.setSenderName(sender.getStudentName());
            message.setType("typing");

            // Broadcast typing indicator to all subscribers
            messagingTemplate.convertAndSend("/topic/typing/" + orderId, message);
            
        } catch (Exception e) {
            logger.error("❌ Typing indicator error: {}", e.getMessage());
        }
    }

    /**
     * Handle "user connected" notifications
     * Clients send to: /app/user-joined/order/{orderId}
     * Broadcasts to: /topic/order/{orderId}
     */
    @MessageMapping("/user-joined/order/{orderId}")
    public void handleUserJoined(@Payload WebSocketMessage message, Principal principal) {
        if (principal == null) return;

        try {
            Long orderId = message.getOrderId();
            Student sender = studentRepository.findByEmail(principal.getName()).orElse(null);
            if (sender == null) return;

            message.setSenderId(sender.getId());
            message.setSenderName(sender.getStudentName());
            message.setType("notification");
            message.setContent(sender.getStudentName() + " joined the chat");

            messagingTemplate.convertAndSend("/topic/order/" + orderId, message);
            
            logger.info("🔗 User connected to order {}: {}", orderId, sender.getStudentName());
            
        } catch (Exception e) {
            logger.error("❌ User joined error: {}", e.getMessage());
        }
    }
}
