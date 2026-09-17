package org.example.duwaz.controller;

import org.example.duwaz.classesFolder.Message;
import org.example.duwaz.classesFolder.Order;
import org.example.duwaz.classesFolder.Student;
import org.example.duwaz.repo.MessageRepository;
import org.example.duwaz.repo.OrderRepository;
import org.example.duwaz.repo.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
public class MessageController {

    @Autowired private MessageRepository messageRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private StudentRepository studentRepository;

    // ── Send a message on an order ─────────────────────────────────────────────
    @PostMapping("/order/{orderId}")
    public ResponseEntity<?> sendMessage(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> payload,
            Authentication auth) {
        try {
            String content = payload.get("content");
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Message content cannot be empty");
            }

            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            Student sender = studentRepository.findByEmail(auth.getName())
                    .orElseThrow(() -> new RuntimeException("Sender not found"));

            // Verify sender is either customer or shop owner
            if (!order.getStudent().getId().equals(sender.getId()) &&
                !order.getBusiness().getStudent().getId().equals(sender.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Access denied: not part of this order");
            }

            Message message = new Message(order, sender, content.trim());
            messageRepository.save(message);

            return ResponseEntity.ok(Map.of(
                    "id", message.getId(),
                    "orderId", orderId,
                    "senderName", sender.getStudentName(),
                    "senderId", sender.getId(),
                    "content", message.getContent(),
                    "createdAt", message.getCreatedAt()
            ));

        } catch (Exception e) {
            System.err.println("[MessageController] sendMessage error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to send message: " + e.getMessage());
        }
    }

    // ── Get all messages on an order (with unread count) ──────────────────────
    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getOrderMessages(
            @PathVariable Long orderId,
            Authentication auth) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            // Verify access (customer or shop owner)
            Student requester = studentRepository.findByEmail(auth.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!order.getStudent().getId().equals(requester.getId()) &&
                !order.getBusiness().getStudent().getId().equals(requester.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Access denied");
            }

            List<Message> messages = messageRepository.findByOrder_IdOrderByCreatedAtDesc(orderId);
            int unreadCount = messageRepository.countByOrder_IdAndIsReadFalse(orderId);

            return ResponseEntity.ok(Map.of(
                    "messages", messages,
                    "unreadCount", unreadCount
            ));

        } catch (Exception e) {
            System.err.println("[MessageController] getOrderMessages error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch messages: " + e.getMessage());
        }
    }

    // ── Mark messages as read ──────────────────────────────────────────────────
    @PostMapping("/order/{orderId}/mark-as-read")
    public ResponseEntity<?> markAsRead(
            @PathVariable Long orderId,
            Authentication auth) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            Student requester = studentRepository.findByEmail(auth.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!order.getStudent().getId().equals(requester.getId()) &&
                !order.getBusiness().getStudent().getId().equals(requester.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Access denied");
            }

            List<Message> unreadMessages = messageRepository.findByOrder_IdAndIsReadFalseOrderByCreatedAtAsc(orderId);
            for (Message msg : unreadMessages) {
                msg.setRead(true);
                messageRepository.save(msg);
            }

            return ResponseEntity.ok(Map.of(
                    "markedAsReadCount", unreadMessages.size()
            ));

        } catch (Exception e) {
            System.err.println("[MessageController] markAsRead error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to mark messages: " + e.getMessage());
        }
    }

    // ── Get unread message count for a user (shop owner view) ────────────────
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(Authentication auth) {
        try {
            Student user = studentRepository.findByEmail(auth.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Count unread messages on orders where user is the shop owner
            long unreadCount = messageRepository.countUnreadForShopOwner(user.getId());

            return ResponseEntity.ok(Map.of(
                    "unreadCount", unreadCount
            ));

        } catch (Exception e) {
            System.err.println("[MessageController] getUnreadCount error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to get unread count: " + e.getMessage());
        }
    }
}
