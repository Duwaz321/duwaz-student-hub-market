package org.example.duwaz.service;

import org.example.duwaz.classesFolder.Order;
import org.example.duwaz.classesFolder.Order.OrderStatus;
import org.example.duwaz.classesFolder.OrderItem;
import org.example.duwaz.classesFolder.Product;
import org.example.duwaz.classesFolder.Student;
import org.example.duwaz.repo.OrderRepository;
import org.example.duwaz.repo.ProductRepository;
import org.example.duwaz.repo.StudentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    public static final BigDecimal MIN_DELIVERY_FEE = BigDecimal.TEN;

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final StudentRepository studentRepository;
    private final EmailService emailService;

    public OrderService(OrderRepository orderRepository,
                       ProductRepository productRepository,
                       StudentRepository studentRepository,
                       EmailService emailService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.studentRepository = studentRepository;
        this.emailService = emailService;
    }

    public Order createOrder(Order order) {
        BigDecimal productSubtotal = BigDecimal.ZERO;
        // Validate stock for all items before creating order
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                Product product = productRepository.findById(item.getProduct().getId())
                        .orElseThrow(() -> new RuntimeException("Product not found: " + item.getProduct().getId()));
                
                // Only check stock for PRODUCT type (not SERVICE)
                if (product.getProductType() == Product.ProductType.PRODUCT) {
                    if (product.getStockQuantity() < item.getQuantity()) {
                        throw new RuntimeException("Insufficient stock for " + product.getName() + 
                                ". Available: " + product.getStockQuantity() + ", Requested: " + item.getQuantity());
                    }
                }
                
                // Link each item back to the order
                item.setOrder(order);
                productSubtotal = productSubtotal.add(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            }
        }
        boolean deliveryRequired = order.getDeliveryAddress() != null
                && !"COLLECTION".equalsIgnoreCase(order.getDeliveryAddress())
                && !"SERVICE_NO_DELIVERY".equalsIgnoreCase(order.getDeliveryAddress());
        BigDecimal deliveryFee = deliveryRequired ? MIN_DELIVERY_FEE : BigDecimal.ZERO;
        order.setDeliveryFee(deliveryFee);
        order.setTotalAmount(productSubtotal.add(deliveryFee));

        Order savedOrder = orderRepository.save(order);

        if (savedOrder.getBusiness() != null && savedOrder.getBusiness().getStudent() != null) {
            var shopOwnerEmail = savedOrder.getBusiness().getStudent().getEmail();
            if (shopOwnerEmail != null && !shopOwnerEmail.isBlank()) {
                emailService.sendNewOrderEmailToShopOwner(
                        shopOwnerEmail,
                        savedOrder.getBusiness().getBusinessName(),
                        savedOrder.getStudent() != null ? savedOrder.getStudent().getStudentName() : "Customer",
                        savedOrder.getId(),
                        savedOrder.getTotalAmount()
                );
            }
        }

        List<String> adminEmails = studentRepository.findByRole(Student.Role.ADMIN).stream()
                .map(Student::getEmail)
                .filter(email -> email != null && !email.isBlank())
                .collect(Collectors.toList());
        if (!adminEmails.isEmpty()) {
            emailService.sendNewOrderEmailToAdmins(
                    savedOrder.getBusiness() != null ? savedOrder.getBusiness().getBusinessName() : "Your shop",
                    savedOrder.getStudent() != null ? savedOrder.getStudent().getStudentName() : "Customer",
                    savedOrder.getId(),
                    savedOrder.getTotalAmount(),
                    adminEmails
            );
        }

        return savedOrder;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Page<Order> getAllOrdersPaged(Pageable pageable) {
        return orderRepository.findAll(pageable);
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public List<Order> getOrdersByStudentId(Long studentId) {
        return orderRepository.findByStudentId(studentId);
    }

    public List<Order> getOrdersByBusinessId(Long businessId) {
        return orderRepository.findByBusinessId(businessId);
    }

    public Page<Order> getOrdersByBusinessIdPaged(Long businessId, Pageable pageable) {
        return orderRepository.findByBusinessId(businessId, pageable);
    }

    public Page<Order> getOrdersByBusinessIdsPaged(java.util.List<Long> businessIds, Pageable pageable) {
        return orderRepository.findByBusinessIdIn(businessIds, pageable);
    }

    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    public Order updateStatus(Long orderId, OrderStatus newStatus, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        order.setStatus(newStatus);
        if (reason != null && !reason.isEmpty()) {
            order.setCancellationReason(reason);
        }

        Order savedOrder = orderRepository.save(order);

        String shopOwnerEmail = savedOrder.getBusiness() != null && savedOrder.getBusiness().getStudent() != null
                ? savedOrder.getBusiness().getStudent().getEmail() : null;
        if (shopOwnerEmail != null && !shopOwnerEmail.isBlank()) {
            emailService.sendOrderStatusEmailToShopOwner(
                    shopOwnerEmail,
                    savedOrder.getBusiness().getBusinessName(),
                    savedOrder.getStudent() != null ? savedOrder.getStudent().getStudentName() : "Customer",
                    savedOrder.getId(),
                    savedOrder.getStatus().name(),
                    reason
            );
        }

        List<String> adminEmails = studentRepository.findByRole(Student.Role.ADMIN).stream()
                .map(Student::getEmail)
                .filter(email -> email != null && !email.isBlank())
                .collect(Collectors.toList());
        if (!adminEmails.isEmpty()) {
            emailService.sendOrderStatusEmailToAdmins(
                    savedOrder.getStudent() != null ? savedOrder.getStudent().getStudentName() : "Customer",
                    savedOrder.getBusiness() != null ? savedOrder.getBusiness().getBusinessName() : "Shop",
                    savedOrder.getId(),
                    savedOrder.getStatus().name(),
                    reason,
                    adminEmails
            );
        }

        return savedOrder;
    }

    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }

    // Admin stats
    public long countByStatus(OrderStatus status) {
        return orderRepository.countByStatus(status);
    }

    public long countByBusinessAndStatus(Long businessId, OrderStatus status) {
        return orderRepository.countByBusinessIdAndStatus(businessId, status);
    }

    public long countByBusiness(Long businessId) {
        return orderRepository.countByBusinessId(businessId);
    }

    public java.math.BigDecimal sumRevenue() {
        java.math.BigDecimal rev = orderRepository.sumRevenue();
        return rev != null ? rev : java.math.BigDecimal.ZERO;
    }

    public long countAllOrders() {
        return orderRepository.count();
    }
}
