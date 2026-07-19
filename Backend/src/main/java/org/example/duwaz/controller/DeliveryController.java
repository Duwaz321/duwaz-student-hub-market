package org.example.duwaz.controller;

import org.example.duwaz.classesFolder.DeliverDriver;
import org.example.duwaz.classesFolder.DeliveryAssignment;
import org.example.duwaz.classesFolder.DeliveryAssignment.DeliveryStatus;
import org.example.duwaz.classesFolder.Student;
import org.example.duwaz.repo.DeliverDriverRepository;
import org.example.duwaz.repo.StudentRepository;
import org.example.duwaz.service.DeliveryAssignmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/deliveries")
@CrossOrigin(origins = "*")
public class DeliveryController {

    private final DeliveryAssignmentService assignmentService;
    private final DeliverDriverRepository driverRepository;
    private final StudentRepository studentRepository;

    public DeliveryController(DeliveryAssignmentService assignmentService,
                               DeliverDriverRepository driverRepository,
                               StudentRepository studentRepository) {
        this.assignmentService = assignmentService;
        this.driverRepository = driverRepository;
        this.studentRepository = studentRepository;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private boolean isAdmin(Authentication auth) {
        Student s = studentRepository.findByEmail(auth.getName()).orElse(null);
        return s != null && s.isAdmin();
    }

    private Optional<DeliverDriver> getDriverFromAuth(Authentication auth) {
        return driverRepository.findByEmail(auth.getName());
    }

    // ── Admin: get all available drivers ─────────────────────────────────────
    @GetMapping("/drivers/available")
    public ResponseEntity<?> getAvailableDrivers(Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin only");
        return ResponseEntity.ok(driverRepository.findByStatusAndActiveTrue(DeliverDriver.DriverStatus.AVAILABLE));
    }

    // ── Admin: get all drivers ────────────────────────────────────────────────
    @GetMapping("/drivers")
    public ResponseEntity<?> getAllDrivers(Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin only");
        return ResponseEntity.ok(driverRepository.findAll());
    }

    // ── Admin: assign driver to order ─────────────────────────────────────────
    @PostMapping("/assign")
    public ResponseEntity<?> assignDriver(@RequestBody Map<String, Long> body, Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin only");
        Long orderId = body.get("orderId");
        Long driverId = body.get("driverId");
        if (orderId == null || driverId == null) {
            return ResponseEntity.badRequest().body("orderId and driverId are required");
        }
        try {
            return ResponseEntity.ok(assignmentService.assignDriver(orderId, driverId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ── Admin: get all assignments ────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<?> getAllAssignments(Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin only");
        return ResponseEntity.ok(assignmentService.getAllAssignments());
    }

    // ── Admin: get assignment by order ────────────────────────────────────────
    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getAssignmentByOrder(@PathVariable Long orderId, Authentication auth) {
        return assignmentService.getAssignmentByOrder(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ── Driver: my assigned deliveries ───────────────────────────────────────
    @GetMapping("/my")
    public ResponseEntity<?> getMyDeliveries(Authentication auth) {
        Optional<DeliverDriver> driverOpt = getDriverFromAuth(auth);
        if (driverOpt.isEmpty()) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Driver access only");
        return ResponseEntity.ok(assignmentService.getAssignmentsByDriver(driverOpt.get().getDeliveryDriverId()));
    }

    // ── Driver: active deliveries only ───────────────────────────────────────
    @GetMapping("/my/active")
    public ResponseEntity<?> getMyActiveDeliveries(Authentication auth) {
        Optional<DeliverDriver> driverOpt = getDriverFromAuth(auth);
        if (driverOpt.isEmpty()) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Driver access only");
        return ResponseEntity.ok(assignmentService.getActiveAssignmentsByDriver(driverOpt.get().getDeliveryDriverId()));
    }

    // ── Driver: update delivery status ────────────────────────────────────────
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateDeliveryStatus(@PathVariable Long id,
                                                   @RequestBody Map<String, String> body,
                                                   Authentication auth) {
        Optional<DeliverDriver> driverOpt = getDriverFromAuth(auth);
        boolean adminUser = isAdmin(auth);

        if (driverOpt.isEmpty() && !adminUser) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }

        // Verify the driver owns this assignment (unless admin)
        if (!adminUser && driverOpt.isPresent()) {
            return assignmentService.getAssignmentByOrder(id).map(a -> {
                if (!a.getDriver().getDeliveryDriverId().equals(driverOpt.get().getDeliveryDriverId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).<Object>body("Not your delivery");
                }
                return null;
            }).orElse(null);
        }

        String statusStr = body.get("status");
        String notes = body.get("notes");
        String proof = body.get("proofOfDelivery");

        try {
            DeliveryStatus newStatus = DeliveryStatus.valueOf(statusStr);
            return ResponseEntity.ok(assignmentService.updateStatus(id, newStatus, notes, proof));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid status: " + statusStr);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ── Driver/Customer: verify OTP ───────────────────────────────────────────
    @PostMapping("/{id}/verify-otp")
    public ResponseEntity<?> verifyOtp(@PathVariable Long id,
                                        @RequestBody Map<String, String> body,
                                        Authentication auth) {
        String otp = body.get("otp");
        if (otp == null) return ResponseEntity.badRequest().body("OTP required");
        try {
            return ResponseEntity.ok(assignmentService.verifyOtp(id, otp));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ── Driver: update own status (available/offline/break) ──────────────────
    @PutMapping("/status")
    public ResponseEntity<?> updateMyStatus(@RequestBody Map<String, String> body, Authentication auth) {
        Optional<DeliverDriver> driverOpt = getDriverFromAuth(auth);
        if (driverOpt.isEmpty()) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Driver access only");

        String statusStr = body.get("status");
        try {
            DeliverDriver.DriverStatus newStatus = DeliverDriver.DriverStatus.valueOf(statusStr);
            DeliverDriver driver = driverOpt.get();
            // Can't set available if has active deliveries
            if (newStatus == DeliverDriver.DriverStatus.AVAILABLE &&
                !assignmentService.getActiveAssignmentsByDriver(driver.getDeliveryDriverId()).isEmpty()) {
                return ResponseEntity.badRequest().body("Cannot set available while on an active delivery");
            }
            driver.setStatus(newStatus);
            return ResponseEntity.ok(driverRepository.save(driver));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid status: " + statusStr);
        }
    }

    // ── Driver: get own profile ───────────────────────────────────────────────
    @GetMapping("/profile")
    public ResponseEntity<?> getMyProfile(Authentication auth) {
        Optional<DeliverDriver> driverOpt = getDriverFromAuth(auth);
        if (driverOpt.isEmpty()) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Driver access only");
        return ResponseEntity.ok(driverOpt.get());
    }

    // ── Driver: update own profile ────────────────────────────────────────────
    @PutMapping("/profile")
    public ResponseEntity<?> updateMyProfile(@RequestBody Map<String, String> body, Authentication auth) {
        Optional<DeliverDriver> driverOpt = getDriverFromAuth(auth);
        if (driverOpt.isEmpty()) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Driver access only");

        DeliverDriver driver = driverOpt.get();
        if (body.containsKey("firstName")) driver.setFirstName(body.get("firstName"));
        if (body.containsKey("lastName")) driver.setLastName(body.get("lastName"));
        if (body.containsKey("contactNumber")) driver.setContactNumber(body.get("contactNumber"));
        if (body.containsKey("vehicleType")) driver.setVehicleType(body.get("vehicleType"));
        if (body.containsKey("emergencyContact")) driver.setEmergencyContact(body.get("emergencyContact"));
        if (body.containsKey("profileImage")) driver.setProfileImage(body.get("profileImage"));

        return ResponseEntity.ok(driverRepository.save(driver));
    }
}
