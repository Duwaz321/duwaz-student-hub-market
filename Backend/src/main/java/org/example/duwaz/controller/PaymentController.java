package org.example.duwaz.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.duwaz.classesFolder.*;
import org.example.duwaz.classesFolder.Order.PaymentStatus;
import org.example.duwaz.dto.PaymentInitiateRequest;
import org.example.duwaz.dto.PaymentInitiateResponse;
import org.example.duwaz.repo.BusinessRepository;
import org.example.duwaz.repo.OrderRepository;
import org.example.duwaz.repo.ProductRepository;
import org.example.duwaz.repo.StudentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final OrderRepository orderRepository;
    private final StudentRepository studentRepository;
    private final BusinessRepository businessRepository;
    private final ProductRepository productRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${yoco.secret.key}")
    private String yocoSecretKey;

    @Value("${app.frontend.url:https://duwaz.co.za}")
    private String frontendUrl;

    private static final String YOCO_CHECKOUT_URL = "https://payments.yoco.com/api/checkouts";

    public PaymentController(OrderRepository orderRepository,
                             StudentRepository studentRepository,
                             BusinessRepository businessRepository,
                             ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.studentRepository = studentRepository;
        this.businessRepository = businessRepository;
        this.productRepository = productRepository;
    }

    // ── Step 1: Create order (PENDING/PENDING_PAYMENT) + get Yoco redirect URL ──
    @PostMapping("/initiate")
    public ResponseEntity<?> initiatePayment(
            @RequestBody PaymentInitiateRequest req,
            Authentication auth) {
        try {
            // Resolve student
            Student student = studentRepository.findByEmail(auth.getName())
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            // Resolve business
            Business business = businessRepository.findById(req.getBusinessId())
                    .orElseThrow(() -> new RuntimeException("Shop not found: " + req.getBusinessId()));

            // Build order
            Order order = new Order();
            order.setStudent(student);
            order.setBusiness(business);
            order.setTotalAmount(req.getTotalAmount());
            order.setDeliveryAddress(req.getDeliveryAddress());
            order.setStatus(Order.OrderStatus.PENDING);
            order.setPaymentStatus(PaymentStatus.PENDING);

            // Build order items
            if (req.getItems() != null) {
                List<OrderItem> orderItems = new ArrayList<>();
                for (PaymentInitiateRequest.ItemDto dto : req.getItems()) {
                    Product product = productRepository.findById(dto.getProductId())
                            .orElseThrow(() -> new RuntimeException("Product not found: " + dto.getProductId()));
                    OrderItem item = new OrderItem();
                    item.setOrder(order);
                    item.setProduct(product);
                    item.setQuantity(dto.getQuantity());
                    item.setUnitPrice(dto.getUnitPrice());
                    orderItems.add(item);
                }
                order.setItems(orderItems);
            }

            Order savedOrder = orderRepository.save(order);

            // Call Yoco Checkout API
            // Amount must be in CENTS (integer)
            long amountInCents = req.getTotalAmount()
                    .multiply(BigDecimal.valueOf(100))
                    .longValue();

            Map<String, Object> yocoPayload = new LinkedHashMap<>();
            yocoPayload.put("amount", amountInCents);
            yocoPayload.put("currency", "ZAR");
            yocoPayload.put("successUrl", frontendUrl + "/payment/success?orderId=" + savedOrder.getId());
            yocoPayload.put("cancelUrl",  frontendUrl + "/payment/cancel?orderId=" + savedOrder.getId());
            yocoPayload.put("failureUrl", frontendUrl + "/payment/cancel?orderId=" + savedOrder.getId());
            // Metadata lets you match the webhook back to your order
            Map<String, Object> metadata = new LinkedHashMap<>();
            metadata.put("orderId", savedOrder.getId().toString());
            metadata.put("studentId", student.getId().toString());
            yocoPayload.put("metadata", metadata);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(yocoSecretKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(yocoPayload, headers);

            ResponseEntity<String> yocoResponse = restTemplate.postForEntity(
                    YOCO_CHECKOUT_URL, entity, String.class);

            JsonNode yocoJson = objectMapper.readTree(yocoResponse.getBody());
            String checkoutId  = yocoJson.path("id").asText();
            String redirectUrl = yocoJson.path("redirectUrl").asText();

            if (checkoutId.isBlank() || redirectUrl.isBlank()) {
                throw new RuntimeException("Yoco did not return a valid checkout: " + yocoResponse.getBody());
            }

            // Store checkoutId on order so webhook can find it
            savedOrder.setYocoCheckoutId(checkoutId);
            orderRepository.save(savedOrder);

            return ResponseEntity.ok(new PaymentInitiateResponse(savedOrder.getId(), checkoutId, redirectUrl));

        } catch (Exception e) {
            System.err.println("[PaymentController] initiate error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Payment initiation failed: " + e.getMessage());
        }
    }

    // ── Step 2: Yoco webhook — called by Yoco server when payment completes ───
    // This endpoint MUST be public (no JWT) because Yoco calls it server-to-server.
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody String rawBody) {
        try {
            JsonNode event = objectMapper.readTree(rawBody);
            System.out.println("[Yoco Webhook] Received: " + event.path("type").asText());

            String eventType = event.path("type").asText();

            // Only handle successful payments
            if (!"payment.succeeded".equals(eventType)) {
                return ResponseEntity.ok("ignored");
            }

            JsonNode payload = event.path("payload");
            String checkoutId = payload.path("metadata").path("checkoutId").asText();
            // Yoco also puts orderId in metadata if you set it
            String orderIdStr = payload.path("metadata").path("orderId").asText();

            Order order = null;

            // Try to find by orderId from metadata first
            if (!orderIdStr.isBlank()) {
                try {
                    order = orderRepository.findById(Long.parseLong(orderIdStr)).orElse(null);
                } catch (NumberFormatException ignored) {}
            }

            // Fallback: find by yocoCheckoutId
            if (order == null && !checkoutId.isBlank()) {
                order = orderRepository.findByYocoCheckoutId(checkoutId).orElse(null);
            }

            if (order == null) {
                System.err.println("[Yoco Webhook] Could not match order. checkoutId=" + checkoutId + " orderId=" + orderIdStr);
                // Return 200 so Yoco doesn't retry — log for manual follow-up
                return ResponseEntity.ok("order not found");
            }

            // Mark as paid + confirm
            order.setPaymentStatus(PaymentStatus.PAID);
            if (order.getStatus() == Order.OrderStatus.PENDING) {
                order.setStatus(Order.OrderStatus.CONFIRMED);
            }
            orderRepository.save(order);

            System.out.println("[Yoco Webhook] Order #" + order.getId() + " marked PAID + CONFIRMED");
            return ResponseEntity.ok("ok");

        } catch (Exception e) {
            System.err.println("[Yoco Webhook] Error: " + e.getMessage());
            e.printStackTrace();
            // Return 200 to prevent Yoco retrying endlessly for a parse error
            return ResponseEntity.ok("error handled");
        }
    }

    // ── Customer: check payment status of their own order ─────────────────────
    @GetMapping("/status/{orderId}")
    public ResponseEntity<?> getPaymentStatus(@PathVariable Long orderId, Authentication auth) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) return ResponseEntity.notFound().build();

        // Verify ownership
        if (!order.getStudent().getEmail().equals(auth.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("orderId", order.getId());
        result.put("paymentStatus", order.getPaymentStatus().name());
        result.put("orderStatus", order.getStatus().name());
        return ResponseEntity.ok(result);
    }
}
