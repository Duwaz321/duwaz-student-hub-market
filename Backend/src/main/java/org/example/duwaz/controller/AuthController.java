package org.example.duwaz.controller;

import org.example.duwaz.classesFolder.Student;
import org.example.duwaz.dto.AuthRequest;
import org.example.duwaz.dto.AuthResponse;
import org.example.duwaz.dto.RegisterRequest;
import org.example.duwaz.repo.StudentRepository;
import org.example.duwaz.service.EmailService;
import org.example.duwaz.service.OtpService;
import org.example.duwaz.service.SmsService;
import org.example.duwaz.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private StudentRepository studentRepository;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private EmailService emailService;
    @Autowired private OtpService otpService;
    @Autowired private SmsService smsService;

    private String roleName(Student s) {
        return s.getRole() != null ? s.getRole().name() : "CUSTOMER";
    }

    // ── Step 1: validate fields, save as unverified, send OTP via SMS ──────────
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (studentRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email already registered");
        }
        if (studentRepository.existsByStudentNumber(request.getStudentNumber())) {
            return ResponseEntity.badRequest().body("Student number already registered");
        }
        if (request.getPhoneNumber() == null || request.getPhoneNumber().isBlank()) {
            return ResponseEntity.badRequest().body("Phone number is required for verification");
        }

        // Normalize phone number to international format
        String phone = normalizePhone(request.getPhoneNumber());

        // Save account in unverified state
        Student student = new Student();
        student.setStudentName(request.getStudentName());
        student.setStudentNumber(request.getStudentNumber());
        student.setEmail(request.getEmail());
        student.setPassword(passwordEncoder.encode(request.getPassword()));
        student.setPhoneNumber(phone);
        student.setEmailVerified(false);
        if (request.getLocationAddress() != null && !request.getLocationAddress().isBlank()) {
            student.setLocationAddress(request.getLocationAddress());
        }
        studentRepository.save(student);

        // Generate OTP keyed by phone and send SMS
        try {
            String otp = otpService.generateOtp(phone);
            smsService.sendOtpSms(phone, otp);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(429).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "message", "OTP sent to " + maskPhone(phone),
                        "phone", maskPhone(phone),
                        "otpExpiresInSeconds", otpService.secondsRemaining(phone)
                ));
    }

    // ── Step 2: verify OTP → activate account → return JWT ───────────────────
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp   = body.get("otp");

        if (email == null || otp == null || email.isBlank() || otp.isBlank()) {
            return ResponseEntity.badRequest().body("Email and OTP are required");
        }

        Student student = studentRepository.findByEmail(email).orElse(null);
        if (student == null) return ResponseEntity.badRequest().body("Account not found");

        if (student.isEmailVerified()) {
            String token = jwtUtil.generateToken(student.getEmail(), student.getId(), roleName(student));
            return ResponseEntity.ok(new AuthResponse(token, student.getId(), student.getStudentName(), student.getEmail(), roleName(student), student.getLocationAddress()));
        }

        String phone = student.getPhoneNumber();
        if (phone == null) return ResponseEntity.badRequest().body("No phone number on record");

        boolean valid;
        try {
            valid = otpService.verifyOtp(phone, otp);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }

        if (!valid) return ResponseEntity.status(400).body("Incorrect OTP. Please try again.");

        student.setEmailVerified(true);
        studentRepository.save(student);

        String token = jwtUtil.generateToken(student.getEmail(), student.getId(), roleName(student));
        return ResponseEntity.ok(new AuthResponse(token, student.getId(), student.getStudentName(), student.getEmail(), roleName(student), student.getLocationAddress()));
    }

    // ── Resend OTP ────────────────────────────────────────────────────────────
    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) return ResponseEntity.badRequest().body("Email is required");

        Student student = studentRepository.findByEmail(email).orElse(null);
        if (student == null) return ResponseEntity.badRequest().body("Account not found");
        if (student.isEmailVerified()) return ResponseEntity.ok(Map.of("message", "Account already verified"));

        String phone = student.getPhoneNumber();
        if (phone == null) return ResponseEntity.badRequest().body("No phone number on record");

        try {
            String otp = otpService.generateOtp(phone);
            smsService.sendOtpSms(phone, otp);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(429).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }

        return ResponseEntity.ok(Map.of(
                "message", "New OTP sent to " + maskPhone(phone),
                "otpExpiresInSeconds", otpService.secondsRemaining(phone)
        ));
    }

    // ── Login ─────────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }

        Student student = studentRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (!student.isEmailVerified()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Please verify your phone number before logging in");
        }

        String token = jwtUtil.generateToken(student.getEmail(), student.getId(), roleName(student));
        return ResponseEntity.ok(new AuthResponse(token, student.getId(), student.getStudentName(), student.getEmail(), roleName(student), student.getLocationAddress()));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private String normalizePhone(String phone) {
        phone = phone.replaceAll("\\s+", "").replaceAll("-", "");
        if (phone.startsWith("0")) phone = "+27" + phone.substring(1);
        if (!phone.startsWith("+")) phone = "+" + phone;
        return phone;
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 7) return phone;
        return phone.substring(0, phone.length() - 4).replaceAll("\\d", "*") + phone.substring(phone.length() - 4);
    }
}
