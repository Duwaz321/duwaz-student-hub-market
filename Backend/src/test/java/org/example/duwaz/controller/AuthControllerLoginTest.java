package org.example.duwaz.controller;

import org.example.duwaz.dto.AuthRequest;
import org.example.duwaz.repo.StudentRepository;
import org.example.duwaz.service.AuditLogService;
import org.example.duwaz.service.EmailService;
import org.example.duwaz.service.OtpService;
import org.example.duwaz.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerLoginTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @Mock
    private OtpService otpService;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private AuthController authController;

    @Test
    void loginReturnsUnauthorizedWhenStudentDoesNotExistAfterAuthenticationSucceeds() {
        AuthRequest request = new AuthRequest();
        request.setEmail("missing@example.com");
        request.setPassword("StrongPassword123!");

        when(authenticationManager.authenticate(any())).thenReturn(null);
        when(studentRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        ResponseEntity<?> response = authController.login(request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Invalid email or password", response.getBody());
    }
}
