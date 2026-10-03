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
import org.example.duwaz.service.OrderService;
import org.example.duwaz.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.*;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private BusinessRepository businessRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private TransactionService transactionService;
    @Autowired
    private RestTemplate restTemplate;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private org.example.duwaz.service.AuditLogService auditLogService;

    @Value("${yoco.secret.key:}")
    private String yocoSecretKey;

    @Value("${app.frontend.url:https://duwaz.co.za}")
    private String frontendUrl;

    @Value("${yoco.webhook.secret:}")
    private String yocoWebhookSecret;

    private static final String YOCO_CHECKOUT_URL = "https://payments.yoco.com/api/checkouts";

    // ── Step 1: Initiate Yoco payment ──────────────────────────────────────────
    @PostMapping("/initiate")
    public ResponseEntity<?> initiatePayment(
            @Valid @RequestBody PaymentInitiateRequest req,
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
            order.setDeliveryAddress(req.getDeliveryAddress());
            BigDecimal productSubtotal = req.getItems() == null ? BigDecimal.ZERO
                    : req.getItems().stream()
                            .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
            boolean deliveryRequired = req.getDeliveryAddress() != null
                    && !"COLLECTION".equalsIgnoreCase(req.getDeliveryAddress())
                    && !"SERVICE_NO_DELIVERY".equalsIgnoreCase(req.getDeliveryAddress());
            BigDecimal deliveryFee = deliveryRequired ? OrderService.MIN_DELIVERY_FEE : BigDecimal.ZERO;
            order.setDeliveryFee(deliveryFee);
            order.setTotalAmount(productSubtotal.add(deliveryFee));
            order.setStatus(Order.OrderStatus.PENDING);
            order.setPaymentStatus(PaymentStatus.PENDING);
            order.setPaymentMethod("YOCO");

            // Build order items
            if (req.getItems() != null) {
                List<OrderItem> orderItems = new ArrayList<>();
                Map<Long, Integer> requestedQuantities = new HashMap<>();
                for (PaymentInitiateRequest.ItemDto dto : req.getItems()) {
                    if (dto.getQuantity() <= 0 || dto.getUnitPrice() == null) {
                        return ResponseEntity.badRequest().body("Each item must have a positive quantity and price");
                    }
                    requestedQuantities.merge(dto.getProductId(), dto.getQuantity(), Integer::sum);
                }
                for (Map.Entry<Long, Integer> requested : requestedQuantities.entrySet()) {
                    Long productId = requested.getKey();
                    int quantity = requested.getValue();
                    Product product = productRepository.findById(productId)
                            .orElseThrow(() -> new RuntimeException("Product not found: " + productId));
                    if (product.getBusiness() == null || !business.getId().equals(product.getBusiness().getId())) {
                        return ResponseEntity.badRequest().body("All products must belong to the selected shop");
                    }
                    if (product.getProductType() == Product.ProductType.SERVICE
                            || product.getProductStatus() != Product.ProductStatus.AVAILABLE) {
                        return ResponseEntity.badRequest()
                                .body("Product is not available for purchase: " + product.getName());
                    }
                    if (quantity > product.getStockQuantity()) {
                        return ResponseEntity.badRequest().body("Insufficient stock for: " + product.getName());
                    }
                    OrderItem item = new OrderItem();
                    item.setOrder(order);
                    item.setProduct(product);
                    item.setQuantity(quantity);
                    item.setUnitPrice(product.getPrice());
                    orderItems.add(item);
                }
                order.setItems(orderItems);
            }

            Order savedOrder = orderRepository.save(order);

            // Call Yoco Checkout API
            // Amount must be in CENTS (integer)
            long amountInCents = order.getTotalAmount()
                    .multiply(BigDecimal.valueOf(100))
                    .longValue();

            Map<String, Object> yocoPayload = new LinkedHashMap<>();
            yocoPayload.put("amount", amountInCents);
            yocoPayload.put("currency", "ZAR");
            yocoPayload.put("successUrl", frontendUrl + "/payment/success?orderId=" + savedOrder.getId());
            yocoPayload.put("cancelUrl", frontendUrl + "/payment/cancel?orderId=" + savedOrder.getId());
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
            String checkoutId = yocoJson.path("id").asText();
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
                    .body("Payment initiation failed");
        }
    }

    // ── Confirm Cash on Delivery payment ───────────────────────────────────────
    @PostMapping("/confirm-cash/{orderId}")
    public ResponseEntity<?> confirmCashPayment(
            @PathVariable Long orderId,
            Authentication auth) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            // Verify ownership
            Student student = studentRepository.findByEmail(auth.getName()).orElse(null);
            if (student == null || !order.getStudent().getId().equals(student.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Access denied: not your order");
            }

            // Only CASH orders can be confirmed
            if (!"CASH".equals(order.getPaymentMethod())) {
                return ResponseEntity.badRequest()
                        .body("This order is not a cash payment order");
            }

            // Confirm payment and transition to CONFIRMED
            order.setPaymentStatus(PaymentStatus.PAID);
            if (order.getStatus() == Order.OrderStatus.PENDING) {
                order.setStatus(Order.OrderStatus.CONFIRMED);
            }
            orderRepository.save(order);

            // Record transaction and revenue split
            transactionService.createDeliveryTransaction(order);

            return ResponseEntity.ok(Map.of(
                    "orderId", order.getId(),
                    "paymentStatus", "PAID",
                    "orderStatus", "CONFIRMED",
                    "message", "Cash payment confirmed"));

        } catch (Exception e) {
            System.err.println("[PaymentController] confirm-cash error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Payment confirmation failed");
        }
    }

    // ── Confirm Collection pickup ──────────────────────────────────────────────
    @PostMapping("/confirm-collection/{orderId}")
    public ResponseEntity<?> confirmCollectionPickup(
            @PathVariable Long orderId,
            Authentication auth) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            // Verify ownership
            Student student = studentRepository.findByEmail(auth.getName()).orElse(null);
            if (student == null || !order.getStudent().getId().equals(student.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Access denied: not your order");
            }

            // Only COLLECTION orders can be confirmed
            if (!"COLLECTION".equals(order.getPaymentMethod())) {
                return ResponseEntity.badRequest()
                        .body("This order is not a collection order");
            }

            // Confirm payment (no charge) and transition to CONFIRMED
            order.setPaymentStatus(PaymentStatus.PAID);
            if (order.getStatus() == Order.OrderStatus.PENDING) {
                order.setStatus(Order.OrderStatus.CONFIRMED);
            }
            orderRepository.save(order);

            // Record transaction and revenue split
            transactionService.createDeliveryTransaction(order);

            return ResponseEntity.ok(Map.of(
                    "orderId", order.getId(),
                    "paymentStatus", "PAID",
                    "orderStatus", "CONFIRMED",
                    "message", "Collection order confirmed — ready for pickup"));

        } catch (Exception e) {
            System.err.println("[PaymentController] confirm-collection error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Collection confirmation failed");
        }
    }

    // ── Step 2: Yoco webhook — called by Yoco server when payment completes ───
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String rawBody,
            @RequestHeader(value = "webhook-id", required = false) String webhookId,
            @RequestHeader(value = "webhook-timestamp", required = false) String webhookTimestamp,
            @RequestHeader(value = "webhook-signature", required = false) String webhookSignature) {
        try {
            if (!verifyYocoWebhook(rawBody, webhookId, webhookTimestamp, webhookSignature)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("invalid webhook signature");
            }

            JsonNode event = objectMapper.readTree(rawBody);
            System.out.println(
                    "[Yoco Webhook] Received: " + event.path("event_type").asText(event.path("type").asText()));

            String eventType = event.path("event_type").asText(event.path("type").asText());
            System.out.println("[Yoco Webhook] Event type: " + eventType);

            // Only handle successful payments
            if (!"payment.succeeded".equals(eventType)) {
                return ResponseEntity.ok("ignored");
            }

            JsonNode payload = event.path("payload");
            String checkoutId = payload.path("metadata").path("checkoutId").asText();
            String orderIdStr = payload.path("metadata").path("orderId").asText();

            Order order = null;

            // Try to find by orderId from metadata first
            if (!orderIdStr.isBlank()) {
                try {
                    order = orderRepository.findById(Long.parseLong(orderIdStr)).orElse(null);
                } catch (NumberFormatException ignored) {
                }
            }

            // Fallback: find by yocoCheckoutId
            if (order == null && !checkoutId.isBlank()) {
                order = orderRepository.findByYocoCheckoutId(checkoutId).orElse(null);
            }

            if (order == null) {
                System.err.println(
                        "[Yoco Webhook] Could not match order. checkoutId=" + checkoutId + " orderId=" + orderIdStr);
                return ResponseEntity.ok("order not found");
            }

            if (webhookId.equals(order.getYocoWebhookId())) {
                return ResponseEntity.ok("duplicate");
            }

            // Mark as paid + confirm
            order.setYocoWebhookId(webhookId);
            order.setPaymentStatus(PaymentStatus.PAID);
            if (order.getStatus() == Order.OrderStatus.PENDING) {
                order.setStatus(Order.OrderStatus.CONFIRMED);
            }
            orderRepository.save(order);

            // Record transaction and revenue split
            transactionService.createDeliveryTransaction(order);
            auditLogService.record(order.getStudent().getEmail(), "PAYMENT_WEBHOOK_PROCESSED", "ORDER",
                    String.valueOf(order.getId()), webhookId);

            System.out.println("[Yoco Webhook] Order #" + order.getId() + " marked PAID + CONFIRMED");
            return ResponseEntity.ok("ok");

        } catch (Exception e) {
            System.err.println("[Yoco Webhook] Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("webhook processing failed");
        }
    }

    private boolean verifyYocoWebhook(String rawBody, String webhookId,
            String webhookTimestamp, String webhookSignature) {
        if (yocoWebhookSecret == null || yocoWebhookSecret.isBlank()
                || webhookId == null || webhookTimestamp == null || webhookSignature == null) {
            return false;
        }
        try {
            long timestamp = Long.parseLong(webhookTimestamp);
            if (Math.abs(Instant.now().getEpochSecond() - timestamp) > 180)
                return false;

            String encodedSecret = yocoWebhookSecret.startsWith("whsec_")
                    ? yocoWebhookSecret.substring("whsec_".length())
                    : yocoWebhookSecret;
            byte[] secret = Base64.getDecoder().decode(encodedSecret);
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret, "HmacSHA256"));
            byte[] digest = mac.doFinal((webhookId + "." + webhookTimestamp + "." + rawBody)
                    .getBytes(StandardCharsets.UTF_8));
            String expected = Base64.getEncoder().encodeToString(digest);

            for (String candidate : webhookSignature.split("\\s+")) {
                if (candidate.startsWith("v1,")) {
                    String supplied = candidate.substring(3);
                    if (MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8),
                            supplied.getBytes(StandardCharsets.UTF_8))) {
                        return true;
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("[Yoco Webhook] Signature verification failed: " + e.getMessage());
        }
        return false;
    }

    // ── Check payment status ───────────────────────────────────────────────────
    @GetMapping("/status/{orderId}")
    public ResponseEntity<?> getPaymentStatus(@PathVariable Long orderId, Authentication auth) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null)
            return ResponseEntity.notFound().build();

        // Verify ownership
        if (!order.getStudent().getEmail().equals(auth.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("orderId", order.getId());
        result.put("paymentStatus", order.getPaymentStatus().name());
        result.put("orderStatus", order.getStatus().name());
        result.put("paymentMethod", order.getPaymentMethod());
        return ResponseEntity.ok(result);
    }
}
