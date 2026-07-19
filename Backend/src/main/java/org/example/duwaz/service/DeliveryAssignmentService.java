package org.example.duwaz.service;

import org.example.duwaz.classesFolder.DeliverDriver;
import org.example.duwaz.classesFolder.DeliverDriver.DriverStatus;
import org.example.duwaz.classesFolder.DeliveryAssignment;
import org.example.duwaz.classesFolder.DeliveryAssignment.DeliveryStatus;
import org.example.duwaz.classesFolder.Order;
import org.example.duwaz.repo.DeliverDriverRepository;
import org.example.duwaz.repo.DeliveryAssignmentRepository;
import org.example.duwaz.repo.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
@Transactional
public class DeliveryAssignmentService {

    private final DeliveryAssignmentRepository assignmentRepository;
    private final DeliverDriverRepository driverRepository;
    private final OrderRepository orderRepository;

    public DeliveryAssignmentService(DeliveryAssignmentRepository assignmentRepository,
                                      DeliverDriverRepository driverRepository,
                                      OrderRepository orderRepository) {
        this.assignmentRepository = assignmentRepository;
        this.driverRepository = driverRepository;
        this.orderRepository = orderRepository;
    }

    /** Admin assigns a driver to an order */
    public DeliveryAssignment assignDriver(Long orderId, Long driverId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        DeliverDriver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found: " + driverId));

        if (driver.getStatus() != DriverStatus.AVAILABLE) {
            throw new RuntimeException("Driver is not available. Current status: " + driver.getStatus());
        }

        // Remove existing assignment if any
        assignmentRepository.findByOrderId(orderId).ifPresent(existing -> {
            assignmentRepository.delete(existing);
            // Free the previous driver
            existing.getDriver().setStatus(DriverStatus.AVAILABLE);
            driverRepository.save(existing.getDriver());
        });

        // Generate OTP
        String otp = String.format("%06d", new Random().nextInt(999999));

        DeliveryAssignment assignment = new DeliveryAssignment();
        assignment.setOrder(order);
        assignment.setDriver(driver);
        assignment.setDeliveryStatus(DeliveryStatus.ASSIGNED);
        assignment.setOtpCode(otp);

        // Mark driver busy
        driver.setStatus(DriverStatus.BUSY);
        driverRepository.save(driver);

        // Update order status
        order.setStatus(Order.OrderStatus.OUT_FOR_DELIVERY);
        orderRepository.save(order);

        return assignmentRepository.save(assignment);
    }

    /** Driver accepts a delivery */
    public DeliveryAssignment updateStatus(Long assignmentId, DeliveryStatus newStatus,
                                            String notes, String proofOfDelivery) {
        DeliveryAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found: " + assignmentId));

        assignment.setDeliveryStatus(newStatus);

        switch (newStatus) {
            case DRIVER_ACCEPTED -> assignment.setAcceptedAt(LocalDateTime.now());
            case PICKED_UP -> assignment.setPickedUpAt(LocalDateTime.now());
            case DELIVERED -> {
                assignment.setDeliveredAt(LocalDateTime.now());
                // Mark driver available again
                DeliverDriver driver = assignment.getDriver();
                driver.setStatus(DriverStatus.AVAILABLE);
                driver.setDeliveryCount(driver.getDeliveryCount() + 1);
                driverRepository.save(driver);
                // Update order
                assignment.getOrder().setStatus(Order.OrderStatus.DELIVERED);
                orderRepository.save(assignment.getOrder());
            }
            case DELIVERY_FAILED, CANCELLED -> {
                if (notes != null) assignment.setFailureReason(notes);
                DeliverDriver driver = assignment.getDriver();
                driver.setStatus(DriverStatus.AVAILABLE);
                driverRepository.save(driver);
            }
        }

        if (notes != null && !notes.isEmpty() && newStatus != DeliveryStatus.DELIVERY_FAILED) {
            assignment.setDeliveryNotes(notes);
        }
        if (proofOfDelivery != null && !proofOfDelivery.isEmpty()) {
            assignment.setProofOfDelivery(proofOfDelivery);
        }

        return assignmentRepository.save(assignment);
    }

    /** Verify OTP for delivery confirmation */
    public DeliveryAssignment verifyOtp(Long assignmentId, String otp) {
        DeliveryAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        if (!assignment.getOtpCode().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }
        assignment.setOtpVerified(true);
        return assignmentRepository.save(assignment);
    }

    public List<DeliveryAssignment> getAssignmentsByDriver(Long driverId) {
        return assignmentRepository.findByDriverDeliveryDriverId(driverId);
    }

    public List<DeliveryAssignment> getActiveAssignmentsByDriver(Long driverId) {
        return assignmentRepository.findByDriverDeliveryDriverId(driverId).stream()
                .filter(a -> a.getDeliveryStatus() != DeliveryStatus.DELIVERED
                        && a.getDeliveryStatus() != DeliveryStatus.DELIVERY_FAILED
                        && a.getDeliveryStatus() != DeliveryStatus.CANCELLED)
                .toList();
    }

    public Optional<DeliveryAssignment> getAssignmentByOrder(Long orderId) {
        return assignmentRepository.findByOrderId(orderId);
    }

    public List<DeliveryAssignment> getAllAssignments() {
        return assignmentRepository.findAll();
    }

    public List<DeliveryAssignment> getAssignmentsByStatus(DeliveryStatus status) {
        return assignmentRepository.findByDeliveryStatus(status);
    }
}
