package org.example.duwaz.controller;

import org.example.duwaz.classesFolder.Order;
import org.example.duwaz.classesFolder.Student;
import org.example.duwaz.repo.OrderRepository;
import org.example.duwaz.repo.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/notifications")
@CrossOrigin(origins = "*")
public class AdminNotificationController {

    @Autowired private OrderRepository orderRepository;
    @Autowired private StudentRepository studentRepository;

    // ── Admin: get pending service orders (no delivery assigned) ──────────────
    @GetMapping("/pending-services")
    public ResponseEntity<?> getPendingServiceOrders(Authentication auth) {
        try {
            Student admin = studentRepository.findByEmail(auth.getName()).orElse(null);
            if (admin == null || !admin.isAdmin()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
            }

            // Get all PENDING orders that contain SERVICE type products
            List<Order> allPendingOrders = orderRepository.findByStatus(Order.OrderStatus.PENDING);

            // Filter for service orders (orders where at least one item is a SERVICE)
            List<Order> serviceOrders = allPendingOrders.stream()
                    .filter(order -> order.getItems() != null && order.getItems().stream()
                            .anyMatch(item -> item.getProduct() != null &&
                                    item.getProduct().getProductType() == org.example.duwaz.classesFolder.Product.ProductType.SERVICE))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                    "pendingServiceOrders", serviceOrders,
                    "count", serviceOrders.size()
            ));

        } catch (Exception e) {
            System.err.println("[AdminNotificationController] getPendingServiceOrders error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch service orders: " + e.getMessage());
        }
    }

    // ── Admin: confirm service order and notify shop owner ───────────────────
    @PostMapping("/service/{orderId}/confirm")
    public ResponseEntity<?> confirmServiceOrder(
            @PathVariable Long orderId,
            Authentication auth) {
        try {
            Student admin = studentRepository.findByEmail(auth.getName()).orElse(null);
            if (admin == null || !admin.isAdmin()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
            }

            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            // Check if it's a service order
            boolean isServiceOrder = order.getItems() != null && order.getItems().stream()
                    .anyMatch(item -> item.getProduct() != null &&
                            item.getProduct().getProductType() == org.example.duwaz.classesFolder.Product.ProductType.SERVICE);

            if (!isServiceOrder) {
                return ResponseEntity.badRequest().body("This is not a service order");
            }

            // Transition order to CONFIRMED (shop owner can now see and respond)
            if (order.getStatus() == Order.OrderStatus.PENDING) {
                order.setStatus(Order.OrderStatus.CONFIRMED);
                orderRepository.save(order);
            }

            // TODO: Send notification to shop owner via WebSocket/email
            System.out.println("[AdminNotificationController] Service order #" + orderId + " confirmed. Shop owner should be notified.");

            return ResponseEntity.ok(Map.of(
                    "orderId", orderId,
                    "status", "CONFIRMED",
                    "message", "Service order confirmed and shop owner notified"
            ));

        } catch (Exception e) {
            System.err.println("[AdminNotificationController] confirmServiceOrder error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to confirm order: " + e.getMessage());
        }
    }

    // ── Admin: get service order details (for review before confirming) ──────
    @GetMapping("/service/{orderId}/details")
    public ResponseEntity<?> getServiceOrderDetails(
            @PathVariable Long orderId,
            Authentication auth) {
        try {
            Student admin = studentRepository.findByEmail(auth.getName()).orElse(null);
            if (admin == null || !admin.isAdmin()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
            }

            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            // Verify it's a service order
            boolean isServiceOrder = order.getItems() != null && order.getItems().stream()
                    .anyMatch(item -> item.getProduct() != null &&
                            item.getProduct().getProductType() == org.example.duwaz.classesFolder.Product.ProductType.SERVICE);

            if (!isServiceOrder) {
                return ResponseEntity.badRequest().body("This is not a service order");
            }

            return ResponseEntity.ok(Map.of(
                    "orderId", order.getId(),
                    "customer", order.getStudent().getStudentName(),
                    "customerEmail", order.getStudent().getEmail(),
                    "business", order.getBusiness().getBusinessName(),
                    "items", order.getItems(),
                    "totalAmount", order.getTotalAmount(),
                    "status", order.getStatus().name(),
                    "paymentStatus", order.getPaymentStatus().name(),
                    "orderDate", order.getOrderDate()
            ));

        } catch (Exception e) {
            System.err.println("[AdminNotificationController] getServiceOrderDetails error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch order details: " + e.getMessage());
        }
    }
}
